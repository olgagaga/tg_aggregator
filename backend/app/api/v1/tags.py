"""Tags API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.tag import TagSchema, TagCreate
from app.services.tag_service import TagService

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=List[dict])
async def get_tags(
    session: AsyncSession = Depends(get_session),
) -> List[dict]:
    """
    Get all tags with usage counts.

    Returns a list of tags with their usage statistics.
    """
    tags_with_counts = await TagService.get_all_with_counts(session)
    return [
        {
            **TagSchema.model_validate(tag).model_dump(),
            "usage_count": count,
        }
        for tag, count in tags_with_counts
    ]


@router.post("", response_model=TagSchema, status_code=201)
async def create_tag(
    tag_data: TagCreate,
    session: AsyncSession = Depends(get_session),
) -> TagSchema:
    """Create a new tag (human-created)."""
    # Check if tag already exists
    existing = await TagService.get_by_name(session, tag_data.name)
    if existing:
        raise HTTPException(status_code=400, detail="Tag already exists")

    tag = await TagService.create(session, tag_data)
    return TagSchema.model_validate(tag)

