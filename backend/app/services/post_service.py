"""Post service for database operations."""
from typing import List, Optional

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.post import Post
from app.models.tag import Tag
from app.models.bookmark import Bookmark
from app.models.post_tag import PostTag
from app.schemas.post import PostCreate, PostUpdate


class PostService:
    """Service for post-related database operations."""

    @staticmethod
    async def create(
        session: AsyncSession,
        post_data: PostCreate,
    ) -> Post:
        """Create a new post with optional tags."""
        post = Post(
            id=post_data.id,
            channel_name=post_data.channel_name,
            channel_username=post_data.channel_username,
            content=post_data.content,
            media_urls=post_data.media_urls,
            original_url=post_data.original_url,
            published_at=post_data.published_at,
        )

        # Add tags if provided
        if post_data.tag_ids:
            result = await session.execute(
                select(Tag).where(Tag.id.in_(post_data.tag_ids))
            )
            tags = result.scalars().all()
            post.tags = tags

        session.add(post)
        await session.commit()
        await session.refresh(post, ["tags"])
        return post

    @staticmethod
    async def get_by_id(session: AsyncSession, post_id: str) -> Optional[Post]:
        """Get a post by ID with tags and bookmarks loaded."""
        result = await session.execute(
            select(Post)
            .options(selectinload(Post.tags), selectinload(Post.bookmarks))
            .where(Post.id == post_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        feed_id: Optional[int] = None,
        tag_names: Optional[List[str]] = None,
        search_query: Optional[str] = None,
    ) -> tuple[List[Post], int]:
        """Get paginated posts with optional filtering."""
        query = select(Post).options(selectinload(Post.tags), selectinload(Post.bookmarks))

        # Filter by feed (tag filters)
        if feed_id:
            from app.models.feed import Feed

            feed_result = await session.execute(select(Feed).where(Feed.id == feed_id))
            feed = feed_result.scalar_one_or_none()
            if feed and feed.tag_filters:
                # Join with tags and filter
                query = query.join(PostTag).join(Tag).where(
                    Tag.name.in_(feed.tag_filters)
                ).distinct()

        # Filter by tag names
        if tag_names:
            query = query.join(PostTag).join(Tag).where(Tag.name.in_(tag_names)).distinct()

        # Search in content
        if search_query:
            query = query.where(Post.content.ilike(f"%{search_query}%"))

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await session.execute(count_query)
        total = count_result.scalar() or 0

        # Apply pagination and ordering
        query = query.order_by(Post.published_at.desc()).offset(skip).limit(limit)

        result = await session.execute(query)
        posts = result.unique().scalars().all()
        return list(posts), total

    @staticmethod
    async def update(
        session: AsyncSession,
        post_id: str,
        post_data: PostUpdate,
    ) -> Optional[Post]:
        """Update a post."""
        post = await PostService.get_by_id(session, post_id)
        if not post:
            return None

        if post_data.content is not None:
            post.content = post_data.content
        if post_data.media_urls is not None:
            post.media_urls = post_data.media_urls

        await session.commit()
        await session.refresh(post, ["tags"])
        return post

    @staticmethod
    async def add_tags(
        session: AsyncSession,
        post_id: str,
        tag_ids: List[int],
    ) -> Optional[Post]:
        """Add tags to a post."""
        post = await PostService.get_by_id(session, post_id)
        if not post:
            return None

        result = await session.execute(select(Tag).where(Tag.id.in_(tag_ids)))
        new_tags = result.scalars().all()

        # Add only tags that aren't already associated
        existing_tag_ids = {tag.id for tag in post.tags}
        for tag in new_tags:
            if tag.id not in existing_tag_ids:
                post.tags.append(tag)

        await session.commit()
        await session.refresh(post, ["tags"])
        return post

    @staticmethod
    async def remove_tags(
        session: AsyncSession,
        post_id: str,
        tag_ids: List[int],
    ) -> Optional[Post]:
        """Remove tags from a post."""
        post = await PostService.get_by_id(session, post_id)
        if not post:
            return None

        post.tags = [tag for tag in post.tags if tag.id not in tag_ids]
        await session.commit()
        await session.refresh(post, ["tags"])
        return post

    @staticmethod
    async def is_bookmarked(session: AsyncSession, post_id: str) -> bool:
        """Check if a post is bookmarked."""
        result = await session.execute(
            select(Bookmark).where(Bookmark.post_id == post_id)
        )
        return result.scalar_one_or_none() is not None

