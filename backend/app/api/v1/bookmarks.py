"""Bookmarks API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.bookmark import BookmarkSchema
from app.services.bookmark_service import BookmarkService

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.post("/{post_id}", response_model=dict)
async def toggle_bookmark(
    post_id: str,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Toggle bookmark status for a post.

    If the post is not bookmarked, it will be bookmarked.
    If it is already bookmarked, it will be unbookmarked.
    """
    is_bookmarked, bookmark = await BookmarkService.toggle(session, post_id)
    return {
        "post_id": post_id,
        "is_bookmarked": is_bookmarked,
        "bookmark": BookmarkSchema.model_validate(bookmark).model_dump() if bookmark else None,
    }


@router.get("", response_model=dict)
async def get_bookmarks(
    skip: int = Query(0, ge=0, description="Number of bookmarks to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of bookmarks to return"),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Get all bookmarked posts with pagination."""
    bookmarks, total = await BookmarkService.get_all(session, skip=skip, limit=limit)
    return {
        "items": [BookmarkSchema.model_validate(bm).model_dump() for bm in bookmarks],
        "total": total,
        "skip": skip,
        "limit": limit,
    }

