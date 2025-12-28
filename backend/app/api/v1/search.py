"""Search API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.post import PostSchema
from app.services.post_service import PostService
from app.services.bookmark_service import BookmarkService

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=dict)
async def search_posts(
    q: str = Query(..., description="Search query"),
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to return"),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Search posts using full-text search.

    Note: In Phase 6, this will use BM25 algorithm.
    For now, it uses simple SQL LIKE search.
    """
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    posts_list, total = await PostService.get_all(
        session=session,
        skip=skip,
        limit=limit,
        search_query=q.strip(),
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
        "query": q,
    }

