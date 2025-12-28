"""Channel tracking model."""
from datetime import datetime

from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel


class Channel(SQLModel, table=True):
    """Model to track channel state and latest message ID."""

    __tablename__ = "channels"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=255, description="Channel username (without @)")
    name: str = Field(max_length=255, description="Channel display name")
    channel_id: int | None = Field(default=None, description="Telegram channel ID")
    latest_message_id: int | None = Field(default=None, description="Latest processed message ID")
    is_active: bool = Field(default=True, description="Whether to scrape this channel")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

