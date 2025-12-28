"""Mock LLM tagging service for Phase 5 testing."""
import random
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.tag import AuthorType, Tag
from app.services.post_service import PostService
from app.services.tag_service import TagService

logger = get_logger(__name__)

# Pre-defined tags for ML/DL content
PREDEFINED_TAGS = [
    "machine-learning",
    "deep-learning",
    "neural-networks",
    "nlp",
    "computer-vision",
    "reinforcement-learning",
    "pytorch",
    "tensorflow",
    "research",
    "paper",
    "tutorial",
    "dataset",
    "model",
    "architecture",
    "optimization",
]


class MockLLMTagger:
    """Mock LLM tagger that randomly assigns tags to posts."""

    @staticmethod
    async def tag_post(
        session: AsyncSession,
        post_id: str,
        num_tags: int = None,
    ) -> List[Tag]:
        """
        Tag a post with random tags from predefined list.

        Args:
            session: Database session
            post_id: Post ID to tag
            num_tags: Number of tags to assign (default: random 1-3)

        Returns:
            List of assigned tags
        """
        post = await PostService.get_by_id(session, post_id)
        if not post:
            logger.warning(f"Post {post_id} not found for tagging")
            return []

        # Determine number of tags (1-3, or specified)
        if num_tags is None:
            num_tags = random.randint(1, 3)
        num_tags = min(num_tags, len(PREDEFINED_TAGS))

        # Get or create tags
        selected_tag_names = random.sample(PREDEFINED_TAGS, num_tags)
        assigned_tags = []

        for tag_name in selected_tag_names:
            # Get or create tag with LLM author type
            from app.schemas.tag import TagCreate

            tag_data = TagCreate(name=tag_name, author_type=AuthorType.LLM)
            tag = await TagService.get_or_create(session, tag_data)

            # Ensure tag has LLM author type
            if tag.author_type != AuthorType.LLM:
                tag.author_type = AuthorType.LLM
                await session.commit()
                await session.refresh(tag)

            assigned_tags.append(tag)

        # Add tags to post (only if not already present)
        existing_tag_ids = {tag.id for tag in post.tags}
        new_tag_ids = [tag.id for tag in assigned_tags if tag.id not in existing_tag_ids]

        if new_tag_ids:
            await PostService.add_tags(session, post_id, new_tag_ids)
            logger.info(f"Tagged post {post_id} with {len(new_tag_ids)} tags: {selected_tag_names}")

        return assigned_tags

    @staticmethod
    async def tag_all_untagged_posts(
        session: AsyncSession,
        limit: int = 100,
    ) -> dict:
        """
        Tag all posts that don't have any LLM tags.

        Args:
            session: Database session
            limit: Maximum number of posts to process

        Returns:
            Dictionary with statistics
        """
        from sqlalchemy import select
        from app.models.post import Post
        from app.models.post_tag import PostTag

        from sqlalchemy import func

        # Get posts without any tags
        result = await session.execute(
            select(Post)
            .outerjoin(PostTag, Post.id == PostTag.post_id)
            .group_by(Post.id)
            .having(func.count(PostTag.tag_id) == 0)
            .limit(limit)
        )
        untagged_posts = result.scalars().all()

        tagged_count = 0
        for post in untagged_posts:
            try:
                await MockLLMTagger.tag_post(session, post.id)
                tagged_count += 1
            except Exception as e:
                logger.error(f"Error tagging post {post.id}: {e}")

        logger.info(f"Tagged {tagged_count} out of {len(untagged_posts)} untagged posts")
        return {
            "processed": len(untagged_posts),
            "tagged": tagged_count,
        }

