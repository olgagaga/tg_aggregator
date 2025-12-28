"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.base import close_db, init_db

settings = get_settings()

# Setup logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


# Create FastAPI app
app = FastAPI(
    title="Telegram Aggregator API",
    description="A minimalist Telegram channel aggregator for ML/DL content",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware (configure as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Telegram Aggregator API",
        "version": "0.1.0",
        "docs": "/docs",
    }

