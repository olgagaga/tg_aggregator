# Telegram ML/DL Channel Aggregator

A minimalist, mobile-first aggregator for ML/DL Telegram channels with intelligent filtering, tagging, and search capabilities.

## Overview

This application aggregates posts from multiple ML/DL Telegram channels, filters out irrelevant content using LLM, tags posts automatically, and provides a clean interface for browsing, searching, and organizing content.

**Key Features:**
- 📱 Mobile-first responsive design
- 🏷️ Automatic LLM tagging + manual tag editing
- 🔍 Full-text search (BM25)
- 📚 Custom feeds with tag filters
- 🔖 Bookmarking system
- ⚡ Optimistic UI updates
- ⌨️ Keyboard shortcuts for power users
- 📲 Pull-to-refresh on mobile

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Query (TanStack Query)
- React Router

**Backend (Expected):**
- FastAPI
- PostgreSQL
- Telethon (Telegram scraper)
- OpenAI API (for tagging)

---

## API Endpoints

The frontend expects the following REST API endpoints from the backend:

### Base URL
```
http://localhost:8000/api
```

---

### 📝 Posts

#### `GET /api/posts`
Get paginated list of posts with optional filtering.

**Query Parameters:**
- `limit` (integer, optional): Number of posts to return (default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)
- `feed_id` (string, optional): Filter by feed ID
- `tags` (array, optional): Filter by tag names (e.g., `?tags=tutorial&tags=llm`)
- `search` (string, optional): Search query string

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "channel_name": "string",
      "channel_username": "string",
      "content": "string",
      "media_urls": ["string"] | null,
      "original_url": "string",
      "published_at": "ISO 8601 datetime",
      "tags": [
        {
          "name": "string",
          "author_type": "llm" | "human",
          "created_at": "ISO 8601 datetime"
        }
      ],
      "is_bookmarked": boolean,
      "created_at": "ISO 8601 datetime"
    }
  ],
  "total": integer,
  "has_more": boolean
}
```

---

#### `GET /api/posts/:id`
Get a single post by ID.

**Path Parameters:**
- `id` (string): Post ID

**Response:**
```json
{
  "id": "string",
  "channel_name": "string",
  "channel_username": "string",
  "content": "string",
  "media_urls": ["string"] | null,
  "original_url": "string",
  "published_at": "ISO 8601 datetime",
  "tags": [
    {
      "name": "string",
      "author_type": "llm" | "human",
      "created_at": "ISO 8601 datetime"
    }
  ],
  "is_bookmarked": boolean,
  "created_at": "ISO 8601 datetime"
}
```

---

#### `PATCH /api/posts/:id/tags`
Update tags for a post.

**Path Parameters:**
- `id` (string): Post ID

**Request Body:**
```json
{
  "tags": [
    {
      "name": "string",
      "author_type": "llm" | "human"
    }
  ]
}
```

**Response:**
Same as `GET /api/posts/:id` with updated tags.

---

### 🏷️ Tags

#### `GET /api/tags`
Get all available tags with usage counts.

**Response:**
```json
{
  "tags": [
    {
      "name": "string",
      "count": integer,
      "source": "llm" | "human"
    }
  ]
}
```

---

### 📚 Feeds

#### `GET /api/feeds`
Get all user-created feeds.

**Response:**
```json
{
  "feeds": [
    {
      "id": "string",
      "name": "string",
      "tag_filters": ["string"],
      "created_at": "ISO 8601 datetime"
    }
  ]
}
```

**Note:** The response should always include a default "All Posts" feed:
```json
{
  "id": "all",
  "name": "All Posts",
  "tag_filters": [],
  "created_at": "ISO 8601 datetime"
}
```

---

#### `POST /api/feeds`
Create a new feed.

**Request Body:**
```json
{
  "name": "string",
  "tag_filters": ["string"]
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "tag_filters": ["string"],
  "created_at": "ISO 8601 datetime"
}
```

---

#### `PATCH /api/feeds/:id`
Update an existing feed.

**Path Parameters:**
- `id` (string): Feed ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "tag_filters": ["string (optional)"]
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "tag_filters": ["string"],
  "created_at": "ISO 8601 datetime"
}
```

---

#### `DELETE /api/feeds/:id`
Delete a feed.

**Path Parameters:**
- `id` (string): Feed ID

**Response:**
```
204 No Content
```

---

### 🔍 Search

#### `GET /api/search`
Full-text search using BM25 algorithm.

**Query Parameters:**
- `q` (string, required): Search query
- `limit` (integer, optional): Number of results (default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response:**
Same format as `GET /api/posts`:
```json
{
  "data": [/* Post objects */],
  "total": integer,
  "has_more": boolean
}
```

---

### 🔖 Bookmarks

#### `POST /api/bookmarks/:post_id`
Add a post to bookmarks.

**Path Parameters:**
- `post_id` (string): Post ID

**Response:**
```
204 No Content
```

---

#### `DELETE /api/bookmarks/:post_id`
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
- `limit` (integer, optional): Number of posts (default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response:**
Same format as `GET /api/posts`:
```json
{
  "data": [/* Post objects */],
  "total": integer,
  "has_more": boolean
}
```

---

## Data Models

### Post
```typescript
interface Post {
  id: string;
  channel_name: string;
  channel_username: string;
  content: string;
  media_urls?: string[];
  original_url: string;          // Telegram link (t.me/...)
  published_at: string;           // ISO 8601
  tags: Tag[];
  is_bookmarked: boolean;
  created_at: string;             // ISO 8601
}
```

### Tag
```typescript
interface Tag {
  name: string;
  author_type: 'llm' | 'human';
  created_at: string;             // ISO 8601
}
```

### Feed
```typescript
interface Feed {
  id: string;
  name: string;
  tag_filters: string[];
  created_at: string;             // ISO 8601
}
```

---

## Frontend Features

### Implemented Features

- ✅ **Post Display** - Card-based layout with content, media, tags, and timestamps
- ✅ **Tag Management**
  - Visual differentiation between LLM (blue/gray) and human (amber) tags
  - Click to filter by tag
  - Edit tags with autocomplete suggestions
  - Optimistic UI updates
- ✅ **Feed Management**
  - Create/edit/delete custom feeds
  - Feed selector dropdown
  - Tag-based filtering
- ✅ **Search**
  - Full-text search with 300ms debouncing
  - Dedicated search results view
  - Empty states
- ✅ **Bookmarks**
  - Toggle bookmark state
  - Dedicated bookmarks page
  - Optimistic UI updates
- ✅ **Mobile Optimizations**
  - Pull-to-refresh gesture
  - Responsive design
  - Touch-friendly interactions
- ✅ **Keyboard Shortcuts**
  - `/` - Focus search
  - `N` - Create new feed
  - `B` - Go to bookmarks
  - `,` - Go to settings
  - `H` - Go to home
  - `R` - Refresh posts
  - `?` - Show shortcuts help

### Caching Strategy

The frontend implements aggressive caching using React Query:

- **Posts**: 5-minute stale time with background refetching
- **Tags**: 10-minute stale time
- **Feeds**: Infinite stale time (only updates on mutations)
- **Search**: 30-second stale time
- **Optimistic Updates**: Immediate UI updates for bookmarks and tags with automatic rollback on error

---

## Running the Frontend

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Base URL
VITE_API_URL=http://localhost:8000/api

# Use mock data (for development without backend)
VITE_USE_MOCK_DATA=true
```

**Note:** Set `VITE_USE_MOCK_DATA=false` when the backend is ready.

### Build for Production
```bash
npm run build
```

---

## Backend Requirements

### Scraping Requirements

1. **Telegram Scraper**
   - Use Telethon to fetch messages from configured channels
   - Run daily or on-demand
   - Store raw messages with metadata

2. **LLM Tagging**
   - Process each post through OpenAI API
   - Extract relevant tags based on ML/DL topics
   - Filter out advertisements and irrelevant content
   - Mark tags with `author_type: "llm"`

3. **Database Schema**
   - Posts table: id, channel info, content, media URLs, timestamps
   - Tags table: post_id, tag_name, author_type, created_at
   - Feeds table: id, name, tag_filters, user_id (for future multi-user support)
   - Bookmarks table: post_id, created_at

4. **Search Index**
   - Implement BM25 full-text search on post content
   - Index channel names and content
   - Support for multi-word queries

---

## Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Dark/light theme toggle
- [ ] Channel management UI
- [ ] Export posts to Markdown/JSON
- [ ] PWA support for offline viewing
- [ ] Tag co-occurrence visualization
- [ ] Reading time estimates
- [ ] Infinite scroll with virtualization

---

## License

MIT
