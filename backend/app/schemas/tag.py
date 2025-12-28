"""Tag schemas."""
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.tag import AuthorType


class TagSchema(BaseModel):
    """Tag schema for API responses."""

    id: int
    name: str
    author_type: AuthorType
    created_at: datetime

    class Config:
        from_attributes = True


class TagCreate(BaseModel):
    """Schema for creating a tag."""

    name: str = Field(..., max_length=100)
    author_type: AuthorType = Field(default=AuthorType.HUMAN)

