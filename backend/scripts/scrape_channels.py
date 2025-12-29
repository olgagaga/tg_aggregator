"""CLI script to scrape Telegram channels."""
import asyncio
import sys

from app.core.logging import setup_logging
from app.db.session import AsyncSessionLocal
from app.services.scraper import TelegramScraper

# Setup logging
setup_logging()


async def main():
    """Main function to scrape channels."""
    # if len(sys.argv) < 2:
    #     print("Usage: python scripts/scrape_channels.py <channel_username> [limit]")
    #     print("Example: python scripts/scrape_channels.py example_channel 50")
    #     sys.exit(1)
    #
    # channel_username = sys.argv[1]
    # limit = int(sys.argv[2]) if len(sys.argv) > 2 else 100

    channel_username = "seeallochnaya"
    limit = 2

    async with AsyncSessionLocal() as session:
        async with TelegramScraper() as scraper:
            orchestrator = ScraperOrchestrator(scraper)
            print(f"Scraping channel: @{channel_username}")
            new_posts, total = await orchestrator.scrape_channel(session, channel_username, limit=limit)
            print(f"Results: {new_posts} new posts from {total} messages")


if __name__ == "__main__":
    asyncio.run(main())

