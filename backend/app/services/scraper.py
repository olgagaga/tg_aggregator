"""Telegram scraper service using Telethon."""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from telethon import TelegramClient
from telethon.errors import ChannelPrivateError, UsernameNotOccupiedError
from telethon.tl.types import Message, MessageMediaDocument, MessageMediaPhoto

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.post import PostCreate
from app.services.channel_service import ChannelService
from app.services.post_service import PostService

logger = get_logger(__name__)
settings = get_settings()


class TelegramScraper:
    """Telegram scraper using Telethon."""

    def __init__(self):
        """Initialize the Telegram client."""
        self.client: Optional[TelegramClient] = None
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize and connect the Telegram client."""
        if self._initialized:
            return

        self.client = TelegramClient(
            settings.telegram_session_name,
            settings.telegram_api_id,
            settings.telegram_api_hash,
        )
        await self.client.start()
        self._initialized = True
        logger.info("Telegram client initialized and connected")

    async def close(self) -> None:
        """Close the Telegram client connection."""
        if self.client:
            await self.client.disconnect()
            self._initialized = False
            logger.info("Telegram client disconnected")

    async def __aenter__(self):
        """Async context manager entry."""
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    def _extract_media_urls(self, message: Message) -> List[str]:
        """
        Extract media URLs from a Telegram message.
        
        Note: This stores file references. To get actual download URLs,
        you would need to use client.get_file() or download the file.
        For now, we store references that can be resolved later.
        """
        media_urls = []

        if message.media:
            if isinstance(message.media, MessageMediaPhoto):
                # Photo media - store file reference
                if message.photo:
                    media_urls.append(f"telegram:photo:{message.photo.id}")
            elif isinstance(message.media, MessageMediaDocument):
                # Document/Video media - store file reference
                if message.document:
                    # Check if it's a video
                    is_video = any(
                        attr.__class__.__name__ == "DocumentAttributeVideo"
                        for attr in message.document.attributes
                    )
                    media_type = "video" if is_video else "document"
                    media_urls.append(f"telegram:{media_type}:{message.document.id}")

        return media_urls

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
        Scrape messages from a Telegram channel.

        Args:
            session: Database session
            channel_username: Channel username (without @)
            limit: Maximum number of messages to fetch

        Returns:
            Tuple of (new_posts_count, total_messages_fetched)
        """
        if not self._initialized:
            await self.initialize()

        try:
            # Get or create channel record
            channel_entity = await self.client.get_entity(channel_username)
            channel = await ChannelService.get_or_create(
                session,
                username=channel_username,
                name=channel_entity.title or channel_username,
                channel_id=channel_entity.id,
            )

            # Determine the starting point (latest_message_id + 1)
            min_id = (channel.latest_message_id or 0) + 1 if channel.latest_message_id else 0

            logger.info(
                f"Scraping channel @{channel_username}, starting from message ID {min_id}"
            )

            # Fetch messages
            messages: List[Message] = []
            async for message in self.client.iter_messages(
                channel_entity,
                min_id=min_id,
                limit=limit,
            ):
                if isinstance(message, Message) and message.text:
                    messages.append(message)

            if not messages:
                logger.info(f"No new messages found for @{channel_username}")
                return 0, 0

            # Process and save messages
            new_posts = 0
            latest_message_id = None

            for message in messages:
                # Check if post already exists
                post_id = self._create_post_id(channel_username, message.id)
                existing_post = await PostService.get_by_id(session, post_id)
                if existing_post:
                    logger.debug(f"Post {post_id} already exists, skipping")
                    continue

                # Extract media URLs
                media_urls = self._extract_media_urls(message)

                # Create post
                post_data = PostCreate(
                    id=post_id,
                    channel_name=channel.name,
                    channel_username=channel_username,
                    content=message.text or "",
                    media_urls=media_urls if media_urls else None,
                    original_url=f"https://t.me/{channel_username}/{message.id}",
                    published_at=message.date,
                )

                try:
                    await PostService.create(session, post_data)
                    new_posts += 1
                    logger.debug(f"Created post {post_id}")

                    # Track the latest message ID
                    if latest_message_id is None or message.id > latest_message_id:
                        latest_message_id = message.id

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
                f"Scraped @{channel_username}: {new_posts} new posts from {len(messages)} messages"
            )
            return new_posts, len(messages)

        except ChannelPrivateError:
            logger.error(f"Channel @{channel_username} is private or not accessible")
            return 0, 0
        except UsernameNotOccupiedError:
            logger.error(f"Channel @{channel_username} does not exist")
            return 0, 0
        except Exception as e:
            logger.error(f"Error scraping channel @{channel_username}: {e}", exc_info=True)
            return 0, 0

    async def scrape_all_channels(
        self,
        session: AsyncSession,
        limit_per_channel: int = 100,
    ) -> dict[str, tuple[int, int]]:
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

