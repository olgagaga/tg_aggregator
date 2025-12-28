"""Feed service for database operations."""
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feed import Feed
from app.schemas.feed import FeedCreate, FeedUpdate


class FeedService:
    """Service for feed-related database operations."""

    @staticmethod
    async def create(session: AsyncSession, feed_data: FeedCreate) -> Feed:
        """Create a new feed."""
        feed = Feed(name=feed_data.name, tag_filters=feed_data.tag_filters)
        session.add(feed)
        await session.commit()
        await session.refresh(feed)
        return feed

    @staticmethod
    async def get_by_id(session: AsyncSession, feed_id: int) -> Optional[Feed]:
        """Get a feed by ID."""
        result = await session.execute(select(Feed).where(Feed.id == feed_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(session: AsyncSession) -> List[Feed]:
        """Get all feeds."""
        result = await session.execute(select(Feed).order_by(Feed.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def update(
        session: AsyncSession,
        feed_id: int,
        feed_data: FeedUpdate,
    ) -> Optional[Feed]:
        """Update a feed."""
        feed = await FeedService.get_by_id(session, feed_id)
        if not feed:
            return None

        if feed_data.name is not None:
            feed.name = feed_data.name
        if feed_data.tag_filters is not None:
            feed.tag_filters = feed_data.tag_filters

        await session.commit()
        await session.refresh(feed)
        return feed

    @staticmethod
    async def delete(session: AsyncSession, feed_id: int) -> bool:
        """Delete a feed."""
        feed = await FeedService.get_by_id(session, feed_id)
        if not feed:
            return False

        await session.delete(feed)
        await session.commit()
        return True

