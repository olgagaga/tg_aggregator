"""Tags API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.tag import TagSchema, TagCreate
from app.services.tag_service import TagService

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=dict)
async def get_tags(
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Get all tags with usage counts.

    Returns tags with their usage statistics in frontend-compatible format.
    """
    tags_with_counts = await TagService.get_all_with_counts(session)
    tags_list = [
        {
            "name": tag.name,
            "count": count,
            "source": tag.author_type.value,  # "llm" or "human"
        }
        for tag, count in tags_with_counts
    ]
    return {"tags": tags_list}


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


@router.delete("/{tag_name}", status_code=204)
async def delete_tag(
    tag_name: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    """
    Delete a tag by name.

    This will remove the tag from all posts and delete it from the system.
    """
    tag = await TagService.get_by_name(session, tag_name)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    await TagService.delete(session, tag.id)
    return None

