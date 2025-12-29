"""Posts API routes."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.post import PostSchema, PostUpdate, PostTagsUpdate
from app.services.post_service import PostService
from app.services.bookmark_service import BookmarkService
from app.services.tag_service import TagService

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=dict)
async def get_posts(
    offset: int = Query(0, ge=0, alias="skip", description="Number of posts to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to return"),
    feed_id: Optional[str] = Query(None, description="Filter by feed ID (use 'all' for all posts)"),
    tags: Optional[List[str]] = Query(None, description="Filter by tag names (array)"),
    search: Optional[str] = Query(None, description="Search query string"),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Get paginated list of posts with optional filtering.

    Supports filtering by:
    - feed_id: Filter posts by feed's tag filters (use 'all' for all posts)
    - tags: Array of tag names
    - search: Full-text search in post content
    """
    # Convert feed_id string to int (handle 'all' as None)
    feed_id_int = None
    if feed_id and feed_id != "all":
        try:
            feed_id_int = int(feed_id)
        except ValueError:
            feed_id_int = None

    posts_list, total = await PostService.get_all(
        session=session,
        skip=offset,
        limit=limit,
        feed_id=feed_id_int,
        tag_names=tags,
        search_query=search,
    )

    # Add is_bookmarked flag to each post
    posts_with_bookmarks = []
    for post in posts_list:
        is_bookmarked = await BookmarkService.get_by_post_id(session, post.id) is not None
        post_dict = PostSchema.model_validate(post).model_dump()
        post_dict["is_bookmarked"] = is_bookmarked
        posts_with_bookmarks.append(post_dict)

    return {
        "data": posts_with_bookmarks,
        "total": total,
        "has_more": (offset + limit) < total,
    }


@router.get("/{post_id}", response_model=PostSchema)
async def get_post(
    post_id: str,
    session: AsyncSession = Depends(get_session),
) -> PostSchema:
    """Get a single post by ID."""
    post = await PostService.get_by_id(session, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    is_bookmarked = await BookmarkService.get_by_post_id(session, post_id) is not None
    post_dict = PostSchema.model_validate(post).model_dump()
    post_dict["is_bookmarked"] = is_bookmarked
    return PostSchema(**post_dict)


@router.patch("/{post_id}/tags", response_model=PostSchema)
async def update_post_tags(
    post_id: str,
    tags_data: PostTagsUpdate,
    session: AsyncSession = Depends(get_session),
) -> PostSchema:
    """
    Update tags for a post.

    Request body should contain a list of tags with name and author_type.
    This replaces all existing tags with the provided tags.
    """
    post = await PostService.get_by_id(session, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Get or create tags and collect their IDs
    tag_ids = []
    for tag_info in tags_data.tags:
        tag_name = tag_info.get("name")
        if not tag_name:
            continue

        from app.schemas.tag import TagCreate
        from app.models.tag import AuthorType

        author_type = AuthorType(tag_info.get("author_type", "human"))
        tag_create = TagCreate(name=tag_name, author_type=author_type)
        tag = await TagService.get_or_create(session, tag_create)
        tag_ids.append(tag.id)

    # Remove all existing tags and add new ones
    existing_tag_ids = [tag.id for tag in post.tags]
    if existing_tag_ids:
        await PostService.remove_tags(session, post_id, existing_tag_ids)

    if tag_ids:
        await PostService.add_tags(session, post_id, tag_ids)

    # Refresh post with new tags
    post = await PostService.get_by_id(session, post_id)
    is_bookmarked = await BookmarkService.get_by_post_id(session, post_id) is not None
    post_dict = PostSchema.model_validate(post).model_dump()
    post_dict["is_bookmarked"] = is_bookmarked
    return PostSchema(**post_dict)

