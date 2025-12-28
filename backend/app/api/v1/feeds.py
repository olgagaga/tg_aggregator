"""Feeds API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.feed import FeedSchema, FeedCreate, FeedUpdate
from app.services.feed_service import FeedService

router = APIRouter(prefix="/feeds", tags=["feeds"])


@router.get("", response_model=List[FeedSchema])
async def get_feeds(
    session: AsyncSession = Depends(get_session),
) -> List[FeedSchema]:
    """
    Get all feeds.

    Includes a default "All Posts" feed (virtual, not stored in DB).
    """
    feeds = await FeedService.get_all(session)

    # Add virtual "All Posts" feed
    all_posts_feed = FeedSchema(
        id=0,
        name="All Posts",
        tag_filters=[],
        created_at=None,
    )

    return [all_posts_feed] + [FeedSchema.model_validate(feed) for feed in feeds]


@router.get("/{feed_id}", response_model=FeedSchema)
async def get_feed(
    feed_id: int,
    session: AsyncSession = Depends(get_session),
) -> FeedSchema:
    """Get a single feed by ID."""
    if feed_id == 0:
        # Return virtual "All Posts" feed
        return FeedSchema(
            id=0,
            name="All Posts",
            tag_filters=[],
            created_at=None,
        )

    feed = await FeedService.get_by_id(session, feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    return FeedSchema.model_validate(feed)


@router.post("", response_model=FeedSchema, status_code=201)
async def create_feed(
    feed_data: FeedCreate,
    session: AsyncSession = Depends(get_session),
) -> FeedSchema:
    """Create a new custom feed."""
    feed = await FeedService.create(session, feed_data)
    return FeedSchema.model_validate(feed)


@router.patch("/{feed_id}", response_model=FeedSchema)
async def update_feed(
    feed_id: int,
    feed_data: FeedUpdate,
    session: AsyncSession = Depends(get_session),
) -> FeedSchema:
    """Update a feed."""
    if feed_id == 0:
        raise HTTPException(status_code=400, detail="Cannot update 'All Posts' feed")

    feed = await FeedService.update(session, feed_id, feed_data)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    return FeedSchema.model_validate(feed)


@router.delete("/{feed_id}", status_code=204)
async def delete_feed(
    feed_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a feed."""
    if feed_id == 0:
        raise HTTPException(status_code=400, detail="Cannot delete 'All Posts' feed")

    success = await FeedService.delete(session, feed_id)
    if not success:
        raise HTTPException(status_code=404, detail="Feed not found")

