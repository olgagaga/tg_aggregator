"""Bookmark model."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.post import Post


class Bookmark(SQLModel, table=True):
    """Bookmark model for saving posts."""

    __tablename__ = "bookmarks"

    id: int | None = Field(default=None, primary_key=True)
    post_id: str = Field(foreign_key="posts.id", unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    post: "Post" = Relationship(back_populates="bookmarks")

