"""Channel configuration for scraping."""
from typing import List

from pydantic import BaseModel


class ChannelConfig(BaseModel):
    """Configuration for a channel to scrape."""

    username: str  # Channel username without @
    name: str  # Display name
    is_active: bool = True


# Default channels to track (can be overridden via environment or database)
DEFAULT_CHANNELS: List[ChannelConfig] = [
    # Add your ML/DL channels here
    # Example:
    # ChannelConfig(username="example_channel", name="Example Channel"),
]

