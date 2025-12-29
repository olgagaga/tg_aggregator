"""Channels API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_session
from app.schemas.channel import ChannelSchema, ChannelCreate, ChannelUpdate
from app.services.channel_service import ChannelService
from app.services.scraper import TelegramScraper

router = APIRouter(prefix="/channels", tags=["channels"])


@router.get("", response_model=List[ChannelSchema])
async def get_channels(
    session: AsyncSession = Depends(get_session),
) -> List[ChannelSchema]:
    """
    Get all channels in the scraping list.

    Returns all channels (both active and inactive).
    """
    channels = await ChannelService.get_all_channels(session)
    return [ChannelSchema.model_validate(channel) for channel in channels]


@router.get("/{username}", response_model=ChannelSchema)
async def get_channel(
    username: str,
    session: AsyncSession = Depends(get_session),
) -> ChannelSchema:
    """Get a single channel by username."""
    channel = await ChannelService.get_by_username(session, username)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    return ChannelSchema.model_validate(channel)


@router.post("", response_model=ChannelSchema, status_code=201)
async def create_channel(
    channel_data: ChannelCreate,
    session: AsyncSession = Depends(get_session),
) -> ChannelSchema:
    """
    Add a new channel to the scraping list.

    When the channel is added, we fetch its latest message ID from Telegram and
    pre-populate the `latest_message_id` in the database using a configurable
    history window. The scraper then relies only on this stored value.
    """
    # Check if channel already exists
    existing = await ChannelService.get_by_username(session, channel_data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Channel already exists in scraping list")

    settings = get_settings()

    # Use Telegram to fetch channel metadata and latest message ID once,
    # when the channel is added. The scraper will then rely only on the
    # stored latest_message_id from the database.
    async with TelegramScraper() as scraper:
        try:
            entity = await scraper.client.get_entity(channel_data.username)
        except Exception as exc:
            # Network / Telegram specific errors
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch channel from Telegram: {exc}",
            )

        # Get the latest message ID for the channel
        latest_messages = await scraper.client.get_messages(entity, limit=1)
        latest_message_id = latest_messages[0].id if latest_messages else None

        # Decide how far back to start scraping: store (last_id - window)
        initial_latest_id = None
        if latest_message_id is not None:
            window = max(0, settings.telegram_initial_history_limit)
            initial_latest_id = max(0, latest_message_id - window)

        # Create or update the channel record
        channel = await ChannelService.get_or_create(
            session,
            username=channel_data.username,
            name=channel_data.name
            or (getattr(entity, "title", None) or channel_data.username),
            channel_id=getattr(entity, "id", None),
        )

        if initial_latest_id is not None:
            channel.latest_message_id = initial_latest_id

        # Set active status
        if channel_data.is_active is not None:
            channel.is_active = channel_data.is_active

        await session.commit()
        await session.refresh(channel)

    return ChannelSchema.model_validate(channel)


@router.patch("/{username}", response_model=ChannelSchema)
async def update_channel(
    username: str,
    channel_data: ChannelUpdate,
    session: AsyncSession = Depends(get_session),
) -> ChannelSchema:
    """Update a channel (name or active status)."""
    channel = await ChannelService.get_by_username(session, username)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    if channel_data.name is not None:
        channel.name = channel_data.name
    if channel_data.is_active is not None:
        channel.is_active = channel_data.is_active

    await session.commit()
    await session.refresh(channel)

    return ChannelSchema.model_validate(channel)


@router.delete("/{username}", status_code=204)
async def delete_channel(
    username: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Delete a channel from the scraping list.

    This will remove the channel from tracking but won't delete associated posts.
    """
    from sqlalchemy import delete
    from app.models.channel import Channel

    channel = await ChannelService.get_by_username(session, username)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    await session.delete(channel)
    await session.commit()

