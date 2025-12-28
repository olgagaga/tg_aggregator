"""Database base configuration."""
from sqlmodel import SQLModel

from app.db.session import engine


async def init_db() -> None:
    """Initialize database (create tables)."""
    async with engine.begin() as conn:
        # Import all models here to ensure they're registered
        # This will be populated in Phase 2
        await conn.run_sync(SQLModel.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()

