"""Orchestrator service that coordinates scraping with database operations."""
from typing import Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.channel import Channel
from app.schemas.post import PostCreate
from app.services.channel_service import ChannelService
from app.services.mock_llm_tagger import MockLLMTagger
from app.services.post_service import PostService
from app.services.scraper_base import BaseScraper, ScrapedMessage

logger = get_logger(__name__)


class ScraperOrchestrator:
    """Orchestrator that coordinates scraping with database operations."""

    def __init__(self, scraper: BaseScraper):
        """
        Initialize the orchestrator with a scraper instance.

        Args:
            scraper: Scraper instance implementing BaseScraper interface
        """
        self.scraper = scraper

    def _create_post_id(self, channel_username: str, message_id: int) -> str:
        """Create a unique post ID from channel and message ID."""
        return f"{channel_username}:{message_id}"

    async def scrape_channel(
        self,
        session: AsyncSession,
        channel_username: str,
        limit: int = 100,
    ) -> tuple[int, int]:
        """
        Scrape messages from a channel and save them to the database.

        Args:
            session: Database session
            channel_username: Channel username (without @)
            limit: Maximum number of messages to fetch

        Returns:
            Tuple of (new_posts_count, total_messages_fetched)
        """
        try:
            # Get channel entity from Telegram
            channel_entity = await self.scraper.get_channel_entity(channel_username)

            # Get or create channel record in database
            channel = await ChannelService.get_or_create(
                session,
                username=channel_username,
                name=getattr(channel_entity, "title", None) or channel_username,
                channel_id=channel_entity.id,
            )

            # Determine the starting point only from database values
            if channel.latest_message_id is not None:
                min_id = channel.latest_message_id + 1
            else:
                # Fallback for legacy channels created before this logic existed
                min_id = 0

            logger.info(
                f"Scraping channel @{channel_username}, starting from message ID {min_id}"
            )

            # Fetch messages using the scraper
            scraped_messages = await self.scraper.fetch_messages(
                channel_entity,
                min_id=min_id,
                limit=limit,
            )

            if not scraped_messages:
                logger.info(f"No new messages found for @{channel_username}")
                return 0, 0

            # Process and save messages
            new_posts = 0
            latest_message_id = None

            for scraped_msg in scraped_messages:
                # Check if post already exists
                post_id = self._create_post_id(channel_username, scraped_msg.message_id)
                existing_post = await PostService.get_by_id(session, post_id)
                if existing_post:
                    logger.debug(f"Post {post_id} already exists, skipping")
                    continue

                # Create post
                post_data = PostCreate(
                    id=post_id,
                    channel_name=scraped_msg.channel_name,
                    channel_username=channel_username,
                    content=scraped_msg.content,
                    media_urls=scraped_msg.media_urls if scraped_msg.media_urls else None,
                    original_url=scraped_msg.original_url,
                    published_at=scraped_msg.published_at,
                )

                try:
                    await PostService.create(session, post_data)
                    new_posts += 1
                    logger.debug(f"Created post {post_id}")

                    # Auto-tag with mock LLM (Phase 5)
                    try:
                        await MockLLMTagger.tag_post(session, post_id)
                    except Exception as e:
                        logger.warning(f"Failed to auto-tag post {post_id}: {e}")

                    # Track the latest message ID
                    if latest_message_id is None or scraped_msg.message_id > latest_message_id:
                        latest_message_id = scraped_msg.message_id

                except Exception as e:
                    logger.error(f"Error creating post {post_id}: {e}", exc_info=True)

            # Update channel's latest_message_id
            if latest_message_id:
                await ChannelService.update_latest_message_id(
                    session,
                    channel_username,
                    latest_message_id,
                )
                logger.info(
                    f"Updated latest_message_id for @{channel_username} to {latest_message_id}"
                )

            logger.info(
                f"Scraped @{channel_username}: {new_posts} new posts from {len(scraped_messages)} messages"
            )
            return new_posts, len(scraped_messages)

        except Exception as e:
            logger.error(f"Error scraping channel @{channel_username}: {e}", exc_info=True)
            return 0, 0

    async def scrape_all_channels(
        self,
        session: AsyncSession,
        limit_per_channel: int = 100,
    ) -> Dict[str, tuple[int, int]]:
        """
        Scrape all active channels.

        Args:
            session: Database session
            limit_per_channel: Maximum messages per channel

        Returns:
            Dictionary mapping channel usernames to (new_posts, total_messages) tuples
        """
        channels = await ChannelService.get_active_channels(session)
        results = {}

        for channel in channels:
            new_posts, total = await self.scrape_channel(
                session,
                channel.username,
                limit=limit_per_channel,
            )
            results[channel.username] = (new_posts, total)

        return results

