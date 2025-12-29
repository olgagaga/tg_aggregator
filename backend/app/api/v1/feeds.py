"""Feeds API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.feed import FeedSchema, FeedCreate, FeedUpdate
from app.services.feed_service import FeedService

router = APIRouter(prefix="/feeds", tags=["feeds"])


@router.get("", response_model=dict)
async def get_feeds(
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Get all feeds.

    Includes a default "All Posts" feed (virtual, not stored in DB).
    """
    feeds = await FeedService.get_all(session)

    # Add virtual "All Posts" feed (frontend expects string "all" as ID)
    from datetime import datetime

    all_posts_feed = {
        "id": "all",
        "name": "All Posts",
        "tag_filters": [],
        "created_at": datetime.utcnow().isoformat(),
    }

    feeds_list = [all_posts_feed] + [
        {
            "id": str(feed.id),
            "name": feed.name,
            "tag_filters": feed.tag_filters,
            "created_at": feed.created_at.isoformat() if feed.created_at else None,
        }
        for feed in feeds
    ]

    return {"feeds": feeds_list}


@router.get("/{feed_id}", response_model=dict)
async def get_feed(
    feed_id: str,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Get a single feed by ID."""
    if feed_id == "all":
        # Return virtual "All Posts" feed
        from datetime import datetime

        return {
            "id": "all",
            "name": "All Posts",
            "tag_filters": [],
            "created_at": datetime.utcnow().isoformat(),
        }

    try:
        feed_id_int = int(feed_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid feed ID")

    feed = await FeedService.get_by_id(session, feed_id_int)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    return {
        "id": str(feed.id),
        "name": feed.name,
        "tag_filters": feed.tag_filters,
        "created_at": feed.created_at.isoformat() if feed.created_at else None,
    }


@router.post("", response_model=dict, status_code=201)
async def create_feed(
    feed_data: FeedCreate,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Create a new custom feed."""
    feed = await FeedService.create(session, feed_data)
    return {
        "id": str(feed.id),
        "name": feed.name,
        "tag_filters": feed.tag_filters,
        "created_at": feed.created_at.isoformat() if feed.created_at else None,
    }


@router.patch("/{feed_id}", response_model=dict)
async def update_feed(
    feed_id: str,
    feed_data: FeedUpdate,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Update a feed."""
    if feed_id == "all":
        raise HTTPException(status_code=400, detail="Cannot update 'All Posts' feed")

    try:
        feed_id_int = int(feed_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid feed ID")

    feed = await FeedService.update(session, feed_id_int, feed_data)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    return {
        "id": str(feed.id),
        "name": feed.name,
        "tag_filters": feed.tag_filters,
        "created_at": feed.created_at.isoformat() if feed.created_at else None,
    }


@router.delete("/{feed_id}", status_code=204)
async def delete_feed(
    feed_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Delete a feed."""
    if feed_id == "all":
        raise HTTPException(status_code=400, detail="Cannot delete 'All Posts' feed")

    try:
        feed_id_int = int(feed_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid feed ID")

    success = await FeedService.delete(session, feed_id_int)
    if not success:
        raise HTTPException(status_code=404, detail="Feed not found")

