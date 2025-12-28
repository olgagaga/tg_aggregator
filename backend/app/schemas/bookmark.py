"""Bookmark schemas."""
from datetime import datetime

from pydantic import BaseModel

from app.schemas.post import PostSchema


class BookmarkSchema(BaseModel):
    """Bookmark schema for API responses."""

    id: int
    post_id: str
    post: PostSchema
    created_at: datetime

    class Config:
        from_attributes = True

