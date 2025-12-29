"""Post schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.tag import TagSchema


class PostSchema(BaseModel):
    """Post schema for API responses."""

    id: str
    channel_name: str
    channel_username: str
    content: str
    media_urls: Optional[List[str]] = None
    original_url: str
    published_at: datetime
    tags: List[TagSchema] = Field(default_factory=list)
    is_bookmarked: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    """Schema for creating a post."""

    id: str = Field(..., description="Unique post identifier")
    channel_name: str = Field(..., max_length=255)
    channel_username: str = Field(..., max_length=255)
    content: str
    media_urls: Optional[List[str]] = None
    original_url: str = Field(..., max_length=500)
    published_at: datetime
    tag_ids: Optional[List[int]] = Field(default_factory=list, description="List of tag IDs to associate")


class PostUpdate(BaseModel):
    """Schema for updating a post."""

    content: Optional[str] = None
    media_urls: Optional[List[str]] = None


class PostTagsUpdate(BaseModel):
    """Schema for updating post tags."""

    tags: List[dict] = Field(..., description="List of tags with name and author_type")
