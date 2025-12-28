"""CLI script to scrape all active channels."""
import asyncio

from app.core.logging import setup_logging
from app.db.session import AsyncSessionLocal
from app.services.scraper import TelegramScraper

# Setup logging
setup_logging()


async def main():
    """Main function to scrape all active channels."""
    async with AsyncSessionLocal() as session:
        async with TelegramScraper() as scraper:
            print("Scraping all active channels...")
            results = await scraper.scrape_all_channels(session, limit_per_channel=100)

            print("\nResults:")
            total_new = 0
            total_messages = 0
            for channel, (new_posts, total) in results.items():
                print(f"  @{channel}: {new_posts} new posts from {total} messages")
                total_new += new_posts
                total_messages += total

            print(f"\nTotal: {total_new} new posts from {total_messages} messages")


if __name__ == "__main__":
    asyncio.run(main())

