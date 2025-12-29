"""Telegram scraper implementation using Telethon."""
from typing import List, Optional

from telethon import TelegramClient
from telethon.errors import ChannelPrivateError, UsernameNotOccupiedError
from telethon.tl.types import Message, MessageMediaDocument, MessageMediaPhoto

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.scraper_base import BaseScraper, ScrapedMessage

logger = get_logger(__name__)
settings = get_settings()


class TelegramScraper(BaseScraper):
    """Telegram scraper using Telethon - handles only Telegram operations."""

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

    async def get_channel_entity(self, channel_username: str):
        """Get channel entity from Telegram."""
        if not self._initialized:
            await self.initialize()

        try:
            return await self.client.get_entity(channel_username)
        except ChannelPrivateError:
            logger.error(f"Channel @{channel_username} is private or not accessible")
            raise
        except UsernameNotOccupiedError:
            logger.error(f"Channel @{channel_username} does not exist")
            raise

    async def get_latest_message_id(self, channel_entity) -> Optional[int]:
        """Get the latest message ID for a channel."""
        if not self._initialized:
            await self.initialize()

        latest_messages = await self.client.get_messages(channel_entity, limit=1)
        if latest_messages and len(latest_messages) > 0:
            return latest_messages[0].id
        return None

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

    async def fetch_messages(
        self,
        channel_entity,
        min_id: int = 0,
        limit: int = 100,
    ) -> List[ScrapedMessage]:
        """
        Fetch messages from a Telegram channel.

        Args:
            channel_entity: Telegram channel entity
            min_id: Minimum message ID to fetch (exclusive)
            limit: Maximum number of messages to fetch

        Returns:
            List of ScrapedMessage objects
        """
        if not self._initialized:
            await self.initialize()

        channel_username = getattr(channel_entity, "username", None) or str(channel_entity.id)
        channel_name = getattr(channel_entity, "title", None) or channel_username
        channel_id = channel_entity.id

        messages: List[ScrapedMessage] = []

        try:
            async for message in self.client.iter_messages(
                channel_entity,
                min_id=min_id,
                limit=limit,
            ):
                if isinstance(message, Message) and message.text:
                    # Extract media URLs
                    media_urls = self._extract_media_urls(message)

                    # Create ScrapedMessage
                    scraped_message = ScrapedMessage(
                        message_id=message.id,
                        channel_username=channel_username,
                        channel_name=channel_name,
                        channel_id=channel_id,
                        content=message.text or "",
                        media_urls=media_urls,
                        published_at=message.date,
                        original_url=f"https://t.me/{channel_username}/{message.id}",
                    )
                    messages.append(scraped_message)

        except ChannelPrivateError:
            logger.error(f"Channel @{channel_username} is private or not accessible")
            raise
        except UsernameNotOccupiedError:
            logger.error(f"Channel @{channel_username} does not exist")
            raise
        except Exception as e:
            logger.error(f"Error fetching messages from @{channel_username}: {e}", exc_info=True)
            raise

        return messages
