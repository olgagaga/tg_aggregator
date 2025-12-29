from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database Configuration
    database_url: str
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # Telegram API Credentials
    telegram_api_id: str
    telegram_api_hash: str
    telegram_session_name: str = "session"

    # OpenAI API Key
    openai_api_key: str

    # Application Settings
    environment: Literal["development", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    api_v1_prefix: str = "/api/v1"
    api_prefix: str = "/api"  # Main API prefix for frontend compatibility

    # Scraper Settings
    # How many recent messages to initially include when adding a new channel.
    # When a channel is first added, we set latest_message_id to
    # (current_last_message_id - telegram_initial_history_limit), so that the
    # scraper will fetch only this window of historical messages on first run.
    telegram_initial_history_limit: int = 5

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    @property
    def database_url_async(self) -> str:
        """Convert PostgreSQL URL to async-compatible format."""
        if self.database_url.startswith("postgresql://"):
            # Use psycopg (v3) async driver
            return self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        return self.database_url


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

