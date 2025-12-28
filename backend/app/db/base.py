from sqlmodel import SQLModel

from app.db.session import engine

# Import all models to ensure they're registered with SQLModel
from app.models import Post, Tag, Feed, Bookmark, PostTag, Channel  # noqa: F401


async def init_db() -> None:
    """Initialize database (create tables)."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()

