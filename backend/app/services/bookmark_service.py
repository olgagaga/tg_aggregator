"""Bookmark service for database operations."""
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bookmark import Bookmark
from app.models.post import Post


class BookmarkService:
    """Service for bookmark-related database operations."""

    @staticmethod
    async def create(session: AsyncSession, post_id: str) -> Optional[Bookmark]:
        """Create a bookmark for a post."""
        # Check if post exists
        post_result = await session.execute(select(Post).where(Post.id == post_id))
        if not post_result.scalar_one_or_none():
            return None

        # Check if already bookmarked
        existing = await BookmarkService.get_by_post_id(session, post_id)
        if existing:
            return existing

        bookmark = Bookmark(post_id=post_id)
        session.add(bookmark)
        await session.commit()
        await session.refresh(bookmark, ["post"])
        return bookmark

    @staticmethod
    async def get_by_id(session: AsyncSession, bookmark_id: int) -> Optional[Bookmark]:
        """Get a bookmark by ID."""
        result = await session.execute(
            select(Bookmark)
            .options(selectinload(Bookmark.post).selectinload(Post.tags))
            .where(Bookmark.id == bookmark_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_post_id(session: AsyncSession, post_id: str) -> Optional[Bookmark]:
        """Get a bookmark by post ID."""
        result = await session.execute(
            select(Bookmark).where(Bookmark.post_id == post_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[List[Bookmark], int]:
        """Get all bookmarks with pagination."""
        from sqlalchemy import func

        # Get total count
        count_result = await session.execute(select(func.count(Bookmark.id)))
        total = count_result.scalar() or 0

        # Get paginated bookmarks
        result = await session.execute(
            select(Bookmark)
            .options(selectinload(Bookmark.post).selectinload(Post.tags))
            .order_by(Bookmark.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        bookmarks = list(result.scalars().all())
        return bookmarks, total

    @staticmethod
    async def delete(session: AsyncSession, post_id: str) -> bool:
        """Delete a bookmark by post ID."""
        bookmark = await BookmarkService.get_by_post_id(session, post_id)
        if not bookmark:
            return False

        await session.delete(bookmark)
        await session.commit()
        return True

    @staticmethod
    async def toggle(session: AsyncSession, post_id: str) -> tuple[bool, Optional[Bookmark]]:
        """Toggle bookmark status for a post. Returns (is_bookmarked, bookmark)."""
        bookmark = await BookmarkService.get_by_post_id(session, post_id)
        if bookmark:
            await session.delete(bookmark)
            await session.commit()
            return False, None

        bookmark = await BookmarkService.create(session, post_id)
        return True, bookmark

