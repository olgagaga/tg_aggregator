"""Channel service for database operations."""
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.channel import Channel


class ChannelService:
    """Service for channel-related database operations."""

    @staticmethod
    async def get_by_username(session: AsyncSession, username: str) -> Optional[Channel]:
        """Get a channel by username."""
        result = await session.execute(
            select(Channel).where(Channel.username == username)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_or_create(
        session: AsyncSession,
        username: str,
        name: str,
        channel_id: Optional[int] = None,
    ) -> Channel:
        """Get existing channel or create a new one."""
        channel = await ChannelService.get_by_username(session, username)
        if channel:
            # Update name and channel_id if provided
            if name and channel.name != name:
                channel.name = name
            if channel_id and channel.channel_id != channel_id:
                channel.channel_id = channel_id
            await session.commit()
            await session.refresh(channel)
            return channel

        channel = Channel(username=username, name=name, channel_id=channel_id)
        session.add(channel)
        await session.commit()
        await session.refresh(channel)
        return channel

    @staticmethod
    async def update_latest_message_id(
        session: AsyncSession,
        username: str,
        message_id: int,
    ) -> Optional[Channel]:
        """Update the latest message ID for a channel."""
        channel = await ChannelService.get_by_username(session, username)
        if not channel:
            return None

        channel.latest_message_id = message_id
        await session.commit()
        await session.refresh(channel)
        return channel

    @staticmethod
    async def get_active_channels(session: AsyncSession) -> List[Channel]:
        """Get all active channels."""
        result = await session.execute(
            select(Channel).where(Channel.is_active == True).order_by(Channel.username)
        )
        return list(result.scalars().all())

    @staticmethod
    async def set_active(
        session: AsyncSession,
        username: str,
        is_active: bool,
    ) -> Optional[Channel]:
        """Set channel active status."""
        channel = await ChannelService.get_by_username(session, username)
        if not channel:
            return None

        channel.is_active = is_active
        await session.commit()
        await session.refresh(channel)
        return channel

