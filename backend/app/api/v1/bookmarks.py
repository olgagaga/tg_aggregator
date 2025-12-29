"""Bookmarks API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.bookmark import BookmarkSchema
from app.services.bookmark_service import BookmarkService

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.post("/{post_id}", status_code=204)
async def add_bookmark(
    post_id: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Add a post to bookmarks.

    Frontend expects POST to add bookmark.
    """
    bookmark = await BookmarkService.create(session, post_id)
    if not bookmark:
        raise HTTPException(status_code=404, detail="Post not found")


@router.delete("/{post_id}", status_code=204)
async def remove_bookmark(
    post_id: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Remove a post from bookmarks.

    Frontend expects DELETE to remove bookmark.
    """
    success = await BookmarkService.delete(session, post_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bookmark not found")


@router.get("", response_model=dict)
async def get_bookmarks(
    offset: int = Query(0, ge=0, alias="skip", description="Number of bookmarks to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of bookmarks to return"),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Get all bookmarked posts with pagination."""
    from app.schemas.post import PostSchema

    bookmarks, total = await BookmarkService.get_all(session, skip=offset, limit=limit)

    # Convert bookmarks to post format
    posts_data = []
    for bm in bookmarks:
        post_dict = PostSchema.model_validate(bm.post).model_dump()
        post_dict["is_bookmarked"] = True
        posts_data.append(post_dict)

    return {
        "data": posts_data,
        "total": total,
        "has_more": (offset + limit) < total,
    }

