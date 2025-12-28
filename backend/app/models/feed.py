"""Feed model."""
from datetime import datetime

from sqlalchemy import JSON
from sqlmodel import Column, Field, SQLModel


class Feed(SQLModel, table=True):
    """Feed model for custom tag-filtered feeds."""

    __tablename__ = "feeds"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, index=True)
    tag_filters: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON),
        description="List of tag names to filter posts",
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

