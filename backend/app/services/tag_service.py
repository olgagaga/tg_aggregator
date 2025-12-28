"""Tag service for database operations."""
from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tag import Tag
from app.models.post_tag import PostTag
from app.schemas.tag import TagCreate


class TagService:
    """Service for tag-related database operations."""

    @staticmethod
    async def create(session: AsyncSession, tag_data: TagCreate) -> Tag:
        """Create a new tag."""
        tag = Tag(name=tag_data.name, author_type=tag_data.author_type)
        session.add(tag)
        await session.commit()
        await session.refresh(tag)
        return tag

    @staticmethod
    async def get_by_id(session: AsyncSession, tag_id: int) -> Optional[Tag]:
        """Get a tag by ID."""
        result = await session.execute(select(Tag).where(Tag.id == tag_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_name(session: AsyncSession, name: str) -> Optional[Tag]:
        """Get a tag by name."""
        result = await session.execute(select(Tag).where(Tag.name == name))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_or_create(session: AsyncSession, tag_data: TagCreate) -> Tag:
        """Get existing tag or create a new one."""
        tag = await TagService.get_by_name(session, tag_data.name)
        if tag:
            return tag
        return await TagService.create(session, tag_data)

    @staticmethod
    async def get_all_with_counts(session: AsyncSession) -> List[tuple[Tag, int]]:
        """Get all tags with their usage counts."""
        result = await session.execute(
            select(Tag, func.count(PostTag.tag_id).label("usage_count"))
            .outerjoin(PostTag, Tag.id == PostTag.tag_id)
            .group_by(Tag.id)
            .order_by(Tag.name)
        )
        return [(tag, count or 0) for tag, count in result.all()]

    @staticmethod
    async def get_all(session: AsyncSession) -> List[Tag]:
        """Get all tags."""
        result = await session.execute(select(Tag).order_by(Tag.name))
        return list(result.scalars().all())

    @staticmethod
    async def delete(session: AsyncSession, tag_id: int) -> bool:
        """Delete a tag."""
        tag = await TagService.get_by_id(session, tag_id)
        if not tag:
            return False

        await session.delete(tag)
        await session.commit()
        return True

