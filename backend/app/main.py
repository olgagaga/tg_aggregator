from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.api.v1 import admin, posts, tags, feeds, bookmarks, search
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

# Include API v1 routers
api_v1_router = APIRouter(prefix=settings.api_v1_prefix)
api_v1_router.include_router(posts.router)
api_v1_router.include_router(tags.router)
api_v1_router.include_router(feeds.router)
api_v1_router.include_router(bookmarks.router)
api_v1_router.include_router(search.router)
api_v1_router.include_router(admin.router)
app.include_router(api_v1_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Telegram Aggregator API",
        "version": "0.1.0",
        "docs": "/docs",
    }

