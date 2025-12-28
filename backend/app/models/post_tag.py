"""Post-Tag association table."""
from sqlmodel import Field, SQLModel


class PostTag(SQLModel, table=True):
    """Many-to-many relationship between Posts and Tags."""

    __tablename__ = "post_tags"

    post_id: str = Field(foreign_key="posts.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)

