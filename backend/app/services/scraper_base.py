"""Base scraper interface."""
from abc import ABC, abstractmethod
from typing import List, Optional

from telethon.tl.types import Message


class ScrapedMessage:
    """Data class representing a scraped message."""

    def __init__(
        self,
        message_id: int,
        channel_username: str,
        channel_name: str,
        channel_id: int,
        content: str,
        media_urls: List[str],
        published_at,
        original_url: str,
    ):
        self.message_id = message_id
        self.channel_username = channel_username
        self.channel_name = channel_name
        self.channel_id = channel_id
        self.content = content
        self.media_urls = media_urls
        self.published_at = published_at
        self.original_url = original_url


class BaseScraper(ABC):
    """Base class for all scrapers."""

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize and connect the scraper client."""
        pass

    @abstractmethod
    async def close(self) -> None:
        """Close the scraper connection."""
        pass

    @abstractmethod
    async def get_channel_entity(self, channel_username: str):
        """Get channel entity from the platform."""
        pass

    @abstractmethod
    async def get_latest_message_id(self, channel_entity) -> Optional[int]:
        """Get the latest message ID for a channel."""
        pass

    @abstractmethod
    async def fetch_messages(
        self,
        channel_entity,
        min_id: int = 0,
        limit: int = 100,
    ) -> List[ScrapedMessage]:
        """
        Fetch messages from a channel.

        Args:
            channel_entity: Channel entity object
            min_id: Minimum message ID to fetch (exclusive)
            limit: Maximum number of messages to fetch

        Returns:
            List of ScrapedMessage objects
        """
        pass

    async def __aenter__(self):
        """Async context manager entry."""
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

