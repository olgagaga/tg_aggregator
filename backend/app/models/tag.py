"""Tag model."""
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

# Import PostTag for link_model (needed at runtime)
from app.models.post_tag import PostTag

if TYPE_CHECKING:
    from app.models.post import Post


class AuthorType(str, Enum):
    """Author type enumeration."""

    LLM = "llm"
    HUMAN = "human"


class Tag(SQLModel, table=True):
    """Tag model for categorizing posts."""

    __tablename__ = "tags"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True, max_length=100)
    author_type: AuthorType = Field(
        default=AuthorType.HUMAN,
        description="Whether the tag was created by LLM or human",
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    posts: list["Post"] = Relationship(
        back_populates="tags",
        link_model=PostTag,
    )

