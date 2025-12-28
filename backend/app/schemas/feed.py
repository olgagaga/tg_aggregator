"""Feed schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class FeedSchema(BaseModel):
    """Feed schema for API responses."""

    id: int
    name: str
    tag_filters: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class FeedCreate(BaseModel):
    """Schema for creating a feed."""

    name: str = Field(..., max_length=255)
    tag_filters: List[str] = Field(default_factory=list, description="List of tag names to filter posts")


class FeedUpdate(BaseModel):
    """Schema for updating a feed."""

    name: Optional[str] = Field(None, max_length=255)
    tag_filters: Optional[List[str]] = Field(None, description="List of tag names to filter posts")

