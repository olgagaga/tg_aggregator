# Telegram ML/DL Channel Aggregator - Backend

A FastAPI-based backend for aggregating, filtering, and searching ML/DL content from Telegram channels with intelligent tagging and feed management.

## Overview

This backend service scrapes messages from Telegram channels, processes them with LLM-based tagging, and provides a RESTful API for browsing, searching, and organizing content. The system is designed to be scalable, maintainable, and extensible.

**Key Features:**
- 🔄 Telegram channel scraping with duplicate prevention
- 🏷️ Automatic LLM tagging (currently mock, ready for real LLM integration)
- 🔍 Full-text search (SQL-based, BM25 coming in Phase 6)
- 📚 Custom feeds with tag-based filtering
- 🔖 Bookmarking system
- 📊 Structured logging and monitoring
- 🚀 Async/await throughout for high performance
- 🧩 Modular architecture with clear separation of concerns

## Tech Stack

**Core Framework:**
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.12+** - Latest Python features and type hints

**Database:**
- **PostgreSQL 16** - Reliable relational database
- **SQLModel** - SQL databases in Python, designed for simplicity, compatibility, and robustness
- **Alembic** - Database migration tool
- **psycopg** (v3) - Async PostgreSQL adapter

**Scraping & Processing:**
- **Telethon** - Asynchronous Telegram client library
- **Mock LLM Tagger** - Placeholder for LangChain integration (Phase 7)

**Infrastructure:**
- **Docker & Docker Compose** - Containerization and local development
- **PgBouncer** (optional) - Connection pooling for PostgreSQL
- **Uvicorn** - ASGI server for FastAPI

**Development Tools:**
- **Pydantic v2** - Data validation using Python type annotations
- **python-json-logger** - Structured JSON logging
- **python-dotenv** - Environment variable management

---

## Architecture

### Design Principles

1. **Separation of Concerns**
   - **API Layer** (`app/api/`) - Route handlers, request/response validation
   - **Service Layer** (`app/services/`) - Business logic, orchestration
   - **Data Layer** (`app/models/`, `app/db/`) - Database models and access
   - **Schema Layer** (`app/schemas/`) - API request/response models

2. **Scraper Architecture**
   - **Base Scraper Interface** (`BaseScraper`) - Abstract interface for all scrapers
   - **Telegram Scraper** (`TelegramScraper`) - Pure Telegram operations (no DB logic)
   - **Scraper Orchestrator** (`ScraperOrchestrator`) - Coordinates scraping with database operations

3. **Async-First**
   - All database operations are async
   - All API endpoints are async
   - Efficient connection pooling

### Project Structure

```
backend/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── health.py          # Health check endpoint
│   │   └── v1/                # API v1 routes
│   │       ├── posts.py       # Post endpoints
│   │       ├── tags.py        # Tag endpoints
│   │       ├── feeds.py       # Feed endpoints
│   │       ├── bookmarks.py   # Bookmark endpoints
│   │       ├── search.py      # Search endpoint
│   │       ├── channels.py    # Channel management
│   │       ├── scrape.py      # Scraping operations
│   │       └── admin.py       # Admin/testing endpoints
│   ├── core/                   # Core configuration
│   │   ├── config.py          # Settings and environment variables
│   │   ├── logging.py         # Structured logging setup
│   │   └── channels.py        # Channel configuration
│   ├── db/                     # Database layer
│   │   ├── session.py         # Async session management
│   │   └── base.py            # Database initialization
│   ├── models/                 # SQLModel database models
│   │   ├── post.py            # Post model
│   │   ├── tag.py             # Tag model
│   │   ├── feed.py            # Feed model
│   │   ├── bookmark.py       # Bookmark model
│   │   ├── channel.py         # Channel tracking model
│   │   └── post_tag.py        # Post-Tag association
│   ├── schemas/                # Pydantic schemas for API
│   │   ├── post.py            # Post schemas
│   │   ├── tag.py             # Tag schemas
│   │   ├── feed.py            # Feed schemas
│   │   ├── bookmark.py       # Bookmark schemas
│   │   └── channel.py         # Channel schemas
│   ├── services/               # Business logic layer
│   │   ├── post_service.py    # Post operations
│   │   ├── tag_service.py     # Tag operations
│   │   ├── feed_service.py    # Feed operations
│   │   ├── bookmark_service.py # Bookmark operations
│   │   ├── channel_service.py  # Channel operations
│   │   ├── scraper_base.py     # Base scraper interface
│   │   ├── scraper.py          # Telegram scraper implementation
│   │   ├── scraper_orchestrator.py # Scraping orchestration
│   │   └── mock_llm_tagger.py  # Mock LLM tagging (Phase 5)
│   └── main.py                 # FastAPI application entry point
├── migrations/                 # Alembic migration files
│   ├── env.py                 # Migration environment
│   ├── script.py.mako         # Migration template
│   └── versions/              # Migration versions
├── scripts/                    # Utility scripts
│   ├── scrape_channels.py     # CLI: Scrape single channel
│   └── scrape_all.py          # CLI: Scrape all channels
├── docker-compose.yml          # PostgreSQL and PgBouncer setup
├── alembic.ini                 # Alembic configuration
├── pyproject.toml              # Project dependencies
└── .env                        # Environment variables (not in git)
```

---

## API Endpoints

All endpoints are available at both `/api` (frontend compatibility) and `/api/v1` (versioned).

### Base URL
```
http://localhost:8000/api
```

### 📝 Posts

#### `GET /api/posts`
Get paginated list of posts with optional filtering.

**Query Parameters:**
- `offset` (integer, optional): Number of posts to skip (default: 0)
- `limit` (integer, optional): Number of posts to return (default: 20, max: 100)
- `feed_id` (string, optional): Filter by feed ID (use `"all"` for all posts)
- `tags` (array, optional): Filter by tag names (e.g., `?tags=machine-learning&tags=tutorial`)
- `search` (string, optional): Search query string

**Response:**
```json
{
  "data": [
    {
      "id": "channel_username:12345",
      "channel_name": "ML Channel",
      "channel_username": "ml_channel",
      "content": "Post content...",
      "media_urls": ["telegram:photo:123"] | null,
      "original_url": "https://t.me/ml_channel/12345",
      "published_at": "2025-01-01T12:00:00",
      "tags": [
        {
          "id": 1,
          "name": "machine-learning",
          "author_type": "llm",
          "created_at": "2025-01-01T12:00:00"
        }
      ],
      "is_bookmarked": false,
      "created_at": "2025-01-01T12:00:00"
    }
  ],
  "total": 100,
  "has_more": true
}
```

---

#### `GET /api/posts/{id}`
Get a single post by ID.

**Path Parameters:**
- `id` (string): Post ID (format: `channel_username:message_id`)

**Response:**
Same format as single post object in `GET /api/posts`.

---

#### `PATCH /api/posts/{id}/tags`
Update tags for a post. Replaces all existing tags.

**Path Parameters:**
- `id` (string): Post ID

**Request Body:**
```json
{
  "tags": [
    {
      "name": "machine-learning",
      "author_type": "human"
    },
    {
      "name": "tutorial",
      "author_type": "llm"
    }
  ]
}
```

**Response:**
Updated post object (same format as `GET /api/posts/{id}`).

---

### 🏷️ Tags

#### `GET /api/tags`
Get all available tags with usage counts.

**Response:**
```json
{
  "tags": [
    {
      "name": "machine-learning",
      "count": 42,
      "source": "llm"
    },
    {
      "name": "tutorial",
      "count": 15,
      "source": "human"
    }
  ]
}
```

---

#### `POST /api/tags`
Create a new tag (human-created).

**Request Body:**
```json
{
  "name": "new-tag",
  "author_type": "human"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "new-tag",
  "author_type": "human",
  "created_at": "2025-01-01T12:00:00"
}
```

---

### 📚 Feeds

#### `GET /api/feeds`
Get all user-created feeds (includes default "All Posts" feed).

**Response:**
```json
{
  "feeds": [
    {
      "id": "all",
      "name": "All Posts",
      "tag_filters": [],
      "created_at": "2025-01-01T12:00:00"
    },
    {
      "id": "1",
      "name": "Tutorials",
      "tag_filters": ["tutorial", "how-to"],
      "created_at": "2025-01-01T12:00:00"
    }
  ]
}
```

---

#### `GET /api/feeds/{id}`
Get a single feed by ID.

**Path Parameters:**
- `id` (string): Feed ID (`"all"` for default feed, or numeric string for custom feeds)

**Response:**
Single feed object (same format as in `GET /api/feeds`).

---

#### `POST /api/feeds`
Create a new custom feed.

**Request Body:**
```json
{
  "name": "My Custom Feed",
  "tag_filters": ["machine-learning", "research"]
}
```

**Response:**
Created feed object.

---

#### `PATCH /api/feeds/{id}`
Update an existing feed.

**Path Parameters:**
- `id` (string): Feed ID (cannot be `"all"`)

**Request Body:**
```json
{
  "name": "Updated Name",
  "tag_filters": ["new-tag"]
}
```

**Response:**
Updated feed object.

---

#### `DELETE /api/feeds/{id}`
Delete a feed.

**Path Parameters:**
- `id` (string): Feed ID (cannot be `"all"`)

**Response:**
```
204 No Content
```

---

### 🔍 Search

#### `GET /api/search`
Full-text search in post content.

**Query Parameters:**
- `q` (string, required): Search query
- `offset` (integer, optional): Number of results to skip (default: 0)
- `limit` (integer, optional): Number of results to return (default: 20, max: 100)

**Response:**
Same format as `GET /api/posts`:
```json
{
  "data": [/* Post objects */],
  "total": 25,
  "has_more": false
}
```

**Note:** Currently uses SQL LIKE search. BM25 algorithm will be implemented in Phase 6.

---

### 🔖 Bookmarks

#### `POST /api/bookmarks/{post_id}`
Add a post to bookmarks.

**Path Parameters:**
- `post_id` (string): Post ID

**Response:**
```
204 No Content
```

---

#### `DELETE /api/bookmarks/{post_id}`
Remove a post from bookmarks.

**Path Parameters:**
- `post_id` (string): Post ID

**Response:**
```
204 No Content
```

---

#### `GET /api/bookmarks`
Get all bookmarked posts.

**Query Parameters:**
- `offset` (integer, optional): Number of bookmarks to skip (default: 0)
- `limit` (integer, optional): Number of bookmarks to return (default: 20, max: 100)

**Response:**
Same format as `GET /api/posts`:
```json
{
  "data": [/* Post objects with is_bookmarked: true */],
  "total": 10,
  "has_more": false
}
```

---

### 📡 Channels

#### `GET /api/channels`
Get all channels in the scraping list.

**Response:**
```json
[
  {
    "id": 1,
    "username": "ml_channel",
    "name": "ML Channel",
    "channel_id": 1234567890,
    "latest_message_id": 54321,
    "is_active": true,
    "created_at": "2025-01-01T12:00:00",
    "updated_at": "2025-01-01T12:00:00"
  }
]
```

---

#### `GET /api/channels/{username}`
Get a single channel by username.

**Path Parameters:**
- `username` (string): Channel username (without @)

**Response:**
Single channel object.

---

#### `POST /api/channels`
Add a new channel to the scraping list.

**Request Body:**
```json
{
  "username": "new_channel",
  "name": "New Channel Name",
  "is_active": true
}
```

**Response:**
Created channel object.

**Note:** When a channel is added, the system fetches the latest message ID from Telegram and sets `latest_message_id` to `(current_last_id - telegram_initial_history_limit)` to fetch recent history on first scrape.

---

#### `PATCH /api/channels/{username}`
Update a channel (name or active status).

**Path Parameters:**
- `username` (string): Channel username

**Request Body:**
```json
{
  "name": "Updated Name",
  "is_active": false
}
```

**Response:**
Updated channel object.

---

#### `DELETE /api/channels/{username}`
Remove a channel from the scraping list.

**Path Parameters:**
- `username` (string): Channel username

**Response:**
```
204 No Content
```

---

### 🔄 Scraping

#### `POST /api/scrape/all`
Scrape all active channels.

**Query Parameters:**
- `limit_per_channel` (integer, optional): Maximum messages per channel (default: 100, max: 1000)

**Response:**
```json
{
  "status": "success",
  "channels_scraped": 3,
  "total_new_posts": 45,
  "total_messages": 150,
  "results": {
    "channel1": {
      "new_posts": 15,
      "total_messages": 50
    },
    "channel2": {
      "new_posts": 20,
      "total_messages": 60
    }
  }
}
```

---

#### `POST /api/scrape/{channel_username}`
Scrape a specific channel.

**Path Parameters:**
- `channel_username` (string): Channel username (without @)

**Query Parameters:**
- `limit` (integer, optional): Maximum messages to fetch (default: 100, max: 1000)

**Response:**
```json
{
  "status": "success",
  "channel": "ml_channel",
  "new_posts": 15,
  "total_messages": 50
}
```

---

### 🛠️ Admin

#### `POST /api/admin/tag-post/{post_id}`
Manually trigger mock LLM tagging for a specific post.

**Path Parameters:**
- `post_id` (string): Post ID

**Query Parameters:**
- `num_tags` (integer, optional): Number of tags to assign (default: random 1-3, max: 5)

**Response:**
```json
{
  "post_id": "channel:123",
  "tags_assigned": 2,
  "tags": [
    {"id": 1, "name": "machine-learning"},
    {"id": 2, "name": "research"}
  ]
}
```

---

#### `POST /api/admin/tag-untagged`
Tag all untagged posts with mock LLM tags.

**Query Parameters:**
- `limit` (integer, optional): Maximum posts to process (default: 100, max: 1000)

**Response:**
```json
{
  "processed": 50,
  "tagged": 48
}
```

---

### 🏥 Health

#### `GET /health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T12:00:00",
  "service": "tg-aggregator-backend"
}
```

---

## Data Models

### Database Models (SQLModel)

#### Post
```python
class Post(SQLModel, table=True):
    id: str  # Format: "channel_username:message_id"
    channel_name: str
    channel_username: str
    content: str  # Text content
    media_urls: List[str] | None  # JSON array
    original_url: str
    published_at: datetime
    created_at: datetime
    tags: List[Tag]  # Many-to-many relationship
    bookmarks: List[Bookmark]  # One-to-many relationship
```

#### Tag
```python
class Tag(SQLModel, table=True):
    id: int
    name: str  # Unique
    author_type: AuthorType  # Enum: "llm" or "human"
    created_at: datetime
    posts: List[Post]  # Many-to-many relationship
```

#### Feed
```python
class Feed(SQLModel, table=True):
    id: int
    name: str
    tag_filters: List[str]  # JSONB array
    created_at: datetime
```

#### Bookmark
```python
class Bookmark(SQLModel, table=True):
    id: int
    post_id: str  # Foreign key to Post
    created_at: datetime
    post: Post  # Relationship
```

#### Channel
```python
class Channel(SQLModel, table=True):
    id: int
    username: str  # Unique, without @
    name: str
    channel_id: int | None  # Telegram channel ID (BIGINT)
    latest_message_id: int | None  # Latest processed message (BIGINT)
    is_active: bool
    created_at: datetime
    updated_at: datetime
```

#### PostTag (Association Table)
```python
class PostTag(SQLModel, table=True):
    post_id: str  # Foreign key
    tag_id: int  # Foreign key
    # Composite primary key
```

---

## Setup & Installation

### Prerequisites

- Python 3.12+
- PostgreSQL 16+ (or use Docker)
- Docker & Docker Compose (optional, for local PostgreSQL)
- Telegram API credentials ([Get them here](https://my.telegram.org/apps))
- OpenAI API key (for future LLM integration)

### Installation Steps

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   # Using UV (recommended)
   uv sync
   
   # Or using pip
   pip install -e .
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend root:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://user:password@localhost:5432/tg_aggregator
   DATABASE_POOL_SIZE=10
   DATABASE_MAX_OVERFLOW=20
   
   # Telegram API Credentials
   TELEGRAM_API_ID=your_api_id
   TELEGRAM_API_HASH=your_api_hash
   TELEGRAM_SESSION_NAME=session
   
   # OpenAI API Key (for future LLM integration)
   OPENAI_API_KEY=your_openai_api_key
   
   # Application Settings
   ENVIRONMENT=development
   LOG_LEVEL=INFO
   API_V1_PREFIX=/api/v1
   API_PREFIX=/api
   
   # Scraper Settings
   TELEGRAM_INITIAL_HISTORY_LIMIT=200
   
   # Server Configuration
   HOST=0.0.0.0
   PORT=8000
   ```

4. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```
   
   Or if using PgBouncer:
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations:**
   ```bash
   # Generate initial migration (if not exists)
   uv run alembic revision --autogenerate -m "Initial migration"
   
   # Apply migrations
   uv run alembic upgrade head
   ```

6. **Run the application:**
   ```bash
   uv run python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at:
- API: `http://localhost:8000/api`
- Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

---

## Development Workflow

### Adding a New Channel

1. **Via API:**
   ```bash
   curl -X POST http://localhost:8000/api/channels \
     -H "Content-Type: application/json" \
     -d '{"username": "channel_name", "is_active": true}'
   ```

2. **Via CLI:**
   ```bash
   python scripts/scrape_channels.py channel_name 100
   ```

### Scraping Channels

1. **Scrape all active channels:**
   ```bash
   curl -X POST http://localhost:8000/api/scrape/all?limit_per_channel=100
   ```

2. **Scrape specific channel:**
   ```bash
   curl -X POST http://localhost:8000/api/scrape/channel_name?limit=50
   ```

3. **Via CLI:**
   ```bash
   python scripts/scrape_all.py
   ```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Review the generated migration in migrations/versions/

# Apply migration
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

### Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `DATABASE_POOL_SIZE` | Connection pool size | 10 |
| `DATABASE_MAX_OVERFLOW` | Max overflow connections | 20 |
| `TELEGRAM_API_ID` | Telegram API ID | Required |
| `TELEGRAM_API_HASH` | Telegram API hash | Required |
| `TELEGRAM_SESSION_NAME` | Session file name | "session" |
| `TELEGRAM_INITIAL_HISTORY_LIMIT` | Messages to fetch for new channels | 200 |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `ENVIRONMENT` | Environment (development/staging/production) | "development" |
| `LOG_LEVEL` | Logging level | "INFO" |
| `API_V1_PREFIX` | API v1 prefix | "/api/v1" |
| `API_PREFIX` | Main API prefix | "/api" |
| `HOST` | Server host | "0.0.0.0" |
| `PORT` | Server port | 8000 |

---

## Logging

The backend uses structured JSON logging for easy parsing and monitoring.

**Log Format:**
```json
{
  "timestamp": "2025-01-01T12:00:00",
  "level": "INFO",
  "name": "app.services.scraper",
  "message": "Scraping channel @ml_channel"
}
```

**Log Levels:**
- `DEBUG` - Detailed information for debugging
- `INFO` - General informational messages
- `WARNING` - Warning messages
- `ERROR` - Error messages
- `CRITICAL` - Critical errors

---

## API Response Formats

All API responses follow consistent patterns:

**Success Response:**
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE

**Error Response:**
```json
{
  "detail": "Error message description"
}
```

**Pagination:**
```json
{
  "data": [...],
  "total": 100,
  "has_more": true
}
```

---

## Future Enhancements
- [ ] Finishing LLM-based tagging
- [ ] Fixing DB logging info
- [ ] Refactor service operations 
- [ ] User authentication and multi-user support
- [ ] Rate limiting and API throttling
- [ ] WebSocket support for real-time updates
- [ ] Background job queue (ARQ/Celery)
- [ ] Caching layer (Redis)
- [ ] Metrics and monitoring (Prometheus)
- [ ] API versioning strategy
- [ ] GraphQL endpoint option
- [ ] Export functionality (JSON/CSV)
- [ ] Advanced search filters

---

## License

MIT

