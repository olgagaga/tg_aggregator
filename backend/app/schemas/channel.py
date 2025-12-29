"""Channel schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ChannelSchema(BaseModel):
    """Channel schema for API responses."""

    id: int
    username: str
    name: str
    channel_id: Optional[int] = None
    latest_message_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChannelCreate(BaseModel):
    """Schema for creating a channel."""

    username: str = Field(..., max_length=255, description="Channel username without @")
    name: Optional[str] = Field(None, max_length=255, description="Channel display name (optional)")
    is_active: bool = Field(default=True, description="Whether to scrape this channel")


class ChannelUpdate(BaseModel):
    """Schema for updating a channel."""

    name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None

