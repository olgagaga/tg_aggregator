"""Admin API routes for testing and maintenance."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.services.mock_llm_tagger import MockLLMTagger

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/tag-post/{post_id}")
async def tag_post(
    post_id: str,
    num_tags: int = Query(None, ge=1, le=5, description="Number of tags to assign"),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Manually trigger mock LLM tagging for a specific post."""
    tags = await MockLLMTagger.tag_post(session, post_id, num_tags=num_tags)
    return {
        "post_id": post_id,
        "tags_assigned": len(tags),
        "tags": [{"id": tag.id, "name": tag.name} for tag in tags],
    }


@router.post("/tag-untagged")
async def tag_untagged_posts(
    limit: int = Query(100, ge=1, le=1000, description="Maximum posts to process"),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Tag all untagged posts with mock LLM tags."""
    result = await MockLLMTagger.tag_all_untagged_posts(session, limit=limit)
    return result

