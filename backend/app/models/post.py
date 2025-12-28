"""Post model."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Text
from sqlmodel import Column, Field, Relationship, SQLModel

# Import PostTag for link_model (needed at runtime)
from app.models.post_tag import PostTag

if TYPE_CHECKING:
    from app.models.tag import Tag
    from app.models.bookmark import Bookmark


class Post(SQLModel, table=True):
    """Post model representing a Telegram channel message."""

    __tablename__ = "posts"

    id: str = Field(primary_key=True, description="Unique post identifier (e.g., channel:message_id)")
    channel_name: str = Field(index=True, max_length=255)
    channel_username: str = Field(index=True, max_length=255)
    content: str = Field(sa_column=Column(Text), description="Post text content")
    media_urls: list[str] | None = Field(
        default=None,
        sa_column=Column(JSON),
        description="JSON array of media URLs",
    )
    original_url: str = Field(max_length=500, description="Original Telegram message URL")
    published_at: datetime = Field(index=True, description="When the post was published on Telegram")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    tags: list["Tag"] = Relationship(
        back_populates="posts",
        link_model=PostTag,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    bookmarks: list["Bookmark"] = Relationship(back_populates="post")

