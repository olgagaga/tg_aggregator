"""Scraping API routes."""
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.db.session import get_session
from app.services.scraper import TelegramScraper

router = APIRouter(prefix="/scrape", tags=["scrape"])
logger = get_logger(__name__)


@router.post("/all", response_model=Dict)
async def scrape_all_channels(
    limit_per_channel: int = Query(
        100,
        ge=1,
        le=1000,
        description="Maximum number of messages to fetch per channel",
    ),
    session: AsyncSession = Depends(get_session),
) -> Dict:
    """
    Scrape all active channels.

    This endpoint will scrape all channels that have `is_active=True`.
    Returns a summary of scraping results for each channel.
    """
    try:
        async with TelegramScraper() as scraper:
            results = await scraper.scrape_all_channels(
                session,
                limit_per_channel=limit_per_channel,
            )

            # Format results
            formatted_results = {}
            total_new = 0
            total_messages = 0

            for channel_username, (new_posts, total_msgs) in results.items():
                formatted_results[channel_username] = {
                    "new_posts": new_posts,
                    "total_messages": total_msgs,
                }
                total_new += new_posts
                total_messages += total_msgs

            return {
                "status": "success",
                "channels_scraped": len(results),
                "total_new_posts": total_new,
                "total_messages": total_messages,
                "results": formatted_results,
            }
    except Exception as e:
        logger.error(f"Error scraping all channels: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@router.post("/{channel_username}", response_model=Dict)
async def scrape_channel(
    channel_username: str,
    limit: int = Query(
        100,
        ge=1,
        le=1000,
        description="Maximum number of messages to fetch",
    ),
    session: AsyncSession = Depends(get_session),
) -> Dict:
    """
    Scrape a specific channel.

    This endpoint will scrape messages from the specified channel.
    The channel will be added to the scraping list if it doesn't exist.
    """
    try:
        async with TelegramScraper() as scraper:
            new_posts, total_messages = await scraper.scrape_channel(
                session,
                channel_username,
                limit=limit,
            )

            return {
                "status": "success",
                "channel": channel_username,
                "new_posts": new_posts,
                "total_messages": total_messages,
            }
    except Exception as e:
        logger.error(f"Error scraping channel {channel_username}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Scraping failed for channel {channel_username}: {str(e)}",
        )

