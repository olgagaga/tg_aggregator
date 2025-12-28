"""Tag model."""
from datetime import datetime
from typing import TYPE_CHECKING, Literal

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.post import Post


class Tag(SQLModel, table=True):
    """Tag model for categorizing posts."""

    __tablename__ = "tags"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True, max_length=100)
    author_type: Literal["llm", "human"] = Field(
        default="human",
        description="Whether the tag was created by LLM or human",
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    posts: list["Post"] = Relationship(
        back_populates="tags",
        link_model="PostTag",
    )

