"""Posts API routes."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.post import PostSchema, PostUpdate
from app.services.post_service import PostService
from app.services.bookmark_service import BookmarkService

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=dict)
async def get_posts(
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to return"),
    feed_id: Optional[int] = Query(None, description="Filter by feed ID"),
    tags: Optional[str] = Query(None, description="Comma-separated tag names"),
    search: Optional[str] = Query(None, description="Search query string"),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Get paginated list of posts with optional filtering.

    Supports filtering by:
    - feed_id: Filter posts by feed's tag filters
    - tags: Comma-separated list of tag names
    - search: Full-text search in post content
    """
    tag_names = [t.strip() for t in tags.split(",")] if tags else None

    posts_list, total = await PostService.get_all(
        session=session,
        skip=skip,
        limit=limit,
        feed_id=feed_id,
        tag_names=tag_names,
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
        "items": posts_with_bookmarks,
        "total": total,
        "skip": skip,
        "limit": limit,
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


@router.patch("/{post_id}/tags")
async def update_post_tags(
    post_id: str,
    tag_ids: List[int],
    action: str = Query("add", regex="^(add|remove)$", description="Action: 'add' or 'remove'"),
    session: AsyncSession = Depends(get_session),
) -> PostSchema:
    """
    Update tags for a post.

    - **add**: Add tags to the post
    - **remove**: Remove tags from the post
    """
    if action == "add":
        post = await PostService.add_tags(session, post_id, tag_ids)
    else:
        post = await PostService.remove_tags(session, post_id, tag_ids)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    is_bookmarked = await BookmarkService.get_by_post_id(session, post_id) is not None
    post_dict = PostSchema.model_validate(post).model_dump()
    post_dict["is_bookmarked"] = is_bookmarked
    return PostSchema(**post_dict)

