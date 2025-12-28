## Project Overview

A minimalist, mobile-first Telegram channel aggregator for ML/DL content with filtering, tagging, and search capabilities.

## Tech-Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL 
- **ORM:** SQLModel 
- **Scraper:** Telethon
- **LLM Orchestration:** LangChain
- **Search Engine:** `rank-bm25`
- **Task Scheduling:** ARQ or Celery (for periodic scraping and LLM processing)
- **Environment:** Docker & Docker Compose
## 3. Provided API Endpoints

All endpoints are prefixed with `/api`.

|**Category**|**Method**|**Endpoint**|**Description**|
|---|---|---|---|
|**Posts**|`GET`|`/posts`|Paginated list with tag/feed filters|
||`GET`|`/posts/{id}`|Detailed view of a single post|
||`PATCH`|`/posts/{id}/tags`|Manually update/add tags|
|**Tags**|`GET`|`/tags`|Get all tags with usage counts|
|**Feeds**|`GET`|`/feeds`|Retrieve all custom user feeds|
||`POST`|`/feeds`|Create a new tag-filtered feed|
||`PATCH`|`/feeds/{id}`|Update feed name or filters|
||`DELETE`|`/feeds/{id}`|Delete a specific feed|
|**Search**|`GET`|`/search?q=...`|Full-text search using BM25|
|**Bookmarks**|`POST`|`/bookmarks/{id}`|Bookmark a post|
||`GET`|`/bookmarks`|Retrieve all bookmarked posts|

## Data Models (Pydantic-style)
```Python
class TagSchema(BaseModel):
    name: str
    author_type: Literal["llm", "human"]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PostSchema(BaseModel):
    id: str
    channel_name: str
    channel_username: str
    content: str
    media_urls: Optional[List[str]] = None
    original_url: str
    published_at: datetime
    tags: List[TagSchema]
    is_bookmarked: bool
    created_at: datetime

class FeedSchema(BaseModel):
    id: str
    name: str
    tag_filters: List[str]
    created_at: datetime

class FeedCreate(BaseModel):
    name: str
    tag_filters: List[str]
```
## Folder Structure
```
backend/
├── app/
│   ├── api/                # API route handlers (v1)
│   ├── core/               # Config (env), security, constants
│   ├── db/                 # Session management, migrations
│   ├── models/             # SQLModel/SQLAlchemy database models
│   ├── schemas/            # Pydantic models for API
│   ├── services/           # Business logic (LLM, Scraper, Search)
│   │   ├── scraper.py      # Telethon implementation
│   │   ├── llm_tagger.py   # LangChain pipeline
│   │   └── search_idx.py   # BM25 logic
│   └── main.py             # FastAPI entry point
├── migrations/             # Alembic migration files
├── scripts/                # Standalone maintenance scripts
├── tests/                  # Pytest suite
├── .env                    # Secrets (API keys, DB URL)
└── requirements.txt
```

---

## Development Phases

### Phase 1: Foundation & Core Infrastructure
- [ ] Set up the project structure with asynchronous support and Pydantic v2 validation.
- [ ] Configure **PostgreSQL** with a connection pooler and **SQLModel** for ORM.
- [ ] Implement a `.env` loader for OpenAI keys, Telegram API credentials, and DB URLs.
- [ ] Initialize migrations to handle schema changes for `Posts`, `Tags`, `Feeds`, and `Bookmarks`.
- [ ] **Health & Logging:** Set up structured logging (JSON format) and a `/health` endpoint for monitoring.
### Phase 2: Data Persistence Layer 
- [ ] Implement fields for channel metadata, content, media URLs, and publication timestamps.
- [ ] Create a schema to track tag names and `author_type` (LLM vs. Human).
- [ ] Implement `Feed` with a JSONB column for `tag_filters` to allow flexible query matching.
    - [ ] Create a many-to-many relationship between `Posts` and `Tags`.
- [ ] Create service classes to handle DB operations (e.g., `post_service.py`, `tag_service.py`) to keep logic out of the route handlers.
### Phase 3: Telegram Ingestion Service (Telethon)
- [ ] Configure the Telethon client to connect via MTProto.
- [ ] Develop logic to fetch only messages newer than the `latest_message_id` stored in the DB to avoid duplicates.
- [ ] Implement extraction of photo/video URLs from Telegram messages.
- [ ] Create a configuration-based system to define which channels the scraper should track.
### Phase 4: REST API Core Implementation
- [ ] Implement paginated `GET /api/posts` with support for complex filtering (by feed_id, multiple tags, and search strings).
- [ ] Implement CRUD for custom feeds.
    - [ ] Logic for the "All Posts" default feed.    
- [ ] Implement `PATCH /api/posts/:id/tags` to allow manual editing (Human tags).
- [ ] Build the bookmark toggle endpoints and the `is_bookmarked` flag logic in post responses.
### Phase 5: Backend Mock Testing
- [ ] Implement "Mock LLM tagging" to randomly tags posts using pre-defined tags
- [ ] Test whole backend functionality
### Phase 6: Search & Indexing (BM25)
- [ ] Implement the **BM25** algorithm using the `rank-bm25` library.
- [ ] Create a background task that rebuilds or updates the search index as new posts are processed.
- [ ] Create the `/api/search` route that interfaces with the BM25 index and returns ranked results.
### Phase 7: AI Enrichment & Filtering (LangChain/LangGraph)
- [ ] Design a prompt/chain to classify if a post is relevant to ML/DL or if it's an advertisement/spam.
- [ ] **Automated Tagging:**
    - [ ] Build a **LangChain** pipeline that takes raw text and assign correct tags from pre-defined list  
    - [ ] Use **LangGraph** to handle the workflow: `Ingest -> Filter -> Tag -> Save`.
- [ ] Cost Management: Implement token usage tracking and batch processing to optimize OpenAI API costs.