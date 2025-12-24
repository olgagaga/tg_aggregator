# Telegram Aggregator - Frontend Development Plan

## Project Overview
A minimalist, mobile-first Telegram channel aggregator for ML/DL content with filtering, tagging, and search capabilities.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (server state/caching) + Context API (UI state)
- **HTTP Client**: Axios or Fetch API

## Required Backend API Endpoints

### Posts
- `GET /api/posts` - Get posts with pagination
  - Query params: `limit`, `offset`, `feed_id?`, `tags[]?`, `search?`
  - Response: `{ posts: Post[], total: number, has_more: boolean }`

- `GET /api/posts/:id` - Get single post details

- `PATCH /api/posts/:id/tags` - Update post tags
  - Body: `{ tags: string[], author_type: 'human' }`

### Feeds
- `GET /api/feeds` - Get all user-created feeds
  - Response: `{ feeds: Feed[] }` where Feed = `{ id, name, tag_filters: string[] }`

- `POST /api/feeds` - Create new feed
  - Body: `{ name: string, tag_filters: string[] }`

- `PATCH /api/feeds/:id` - Update feed

- `DELETE /api/feeds/:id` - Delete feed

### Tags
- `GET /api/tags` - Get all available tags with counts
  - Response: `{ tags: Array<{ name: string, count: number, source: 'llm' | 'human' }> }`

### Search
- `GET /api/search` - BM25 full-text search
  - Query params: `q`, `limit`, `offset`

### Bookmarks
- `POST /api/bookmarks/:post_id` - Add bookmark
- `DELETE /api/bookmarks/:post_id` - Remove bookmark
- `GET /api/bookmarks` - Get bookmarked posts

## Data Models (TypeScript Interfaces)

```typescript
interface Post {
  id: string;
  channel_name: string;
  channel_username: string;
  content: string;
  media_urls?: string[];
  original_url: string;
  published_at: string;
  tags: Tag[];
  is_bookmarked: boolean;
  created_at: string;
}

interface Tag {
  name: string;
  author_type: 'llm' | 'human';
  created_at: string;
}

interface Feed {
  id: string;
  name: string;
  tag_filters: string[];
  created_at: string;
}
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Layout.tsx
│   │   ├── posts/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   └── PostSkeleton.tsx
│   │   ├── tags/
│   │   │   ├── TagBadge.tsx
│   │   │   ├── TagEditor.tsx
│   │   │   └── TagFilter.tsx
│   │   ├── feeds/
│   │   │   ├── FeedSelector.tsx
│   │   │   ├── FeedEditor.tsx
│   │   │   └── FeedList.tsx
│   │   └── search/
│   │       └── SearchBar.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PostDetailPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── BookmarksPage.tsx
│   ├── hooks/
│   │   ├── usePosts.ts
│   │   ├── useTags.ts
│   │   ├── useFeeds.ts
│   │   ├── useBookmarks.ts
│   │   ├── useSearch.ts
│   │   └── useInfiniteScroll.ts
│   ├── context/
│   │   ├── FeedContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
```

## Development Phases

### Phase 1: Setup & Foundation ✅ COMPLETED
- [x] Initialize React + TypeScript + Vite project
- [x] Configure Tailwind CSS
- [x] Install and configure shadcn/ui components
- [x] Set up React Query
- [x] Create API service layer with mock data
- [x] Define TypeScript interfaces for all data models
- [x] Set up routing (React Router)
- [x] Create basic layout structure (Header, Navigation, Content area)

### Phase 2: Core Post Display
- [ ] Implement PostCard component
  - Channel name/avatar
  - Post content (with truncation for long posts)
  - Media display (images)
  - Tags display with color coding (LLM vs human)
  - Timestamp
  - Link to original Telegram post
  - Bookmark button
- [ ] Implement PostList with infinite scroll
- [ ] Create PostSkeleton loading state
- [ ] Implement PostDetailPage (expanded view)
- [ ] Add "Read more" expansion for long posts

### Phase 3: Tag System
- [ ] Create TagBadge component (with LLM/human color differentiation)
- [ ] Implement TagEditor (add/remove tags on posts)
- [ ] Create TagFilter component
- [ ] Integrate tag filtering with post list
- [ ] Show tag suggestions from existing tags

### Phase 4: Feed Management
- [ ] Implement FeedSelector dropdown
- [ ] Create "All Posts" default feed
- [ ] Implement FeedEditor modal/drawer
  - Create new feed
  - Edit feed name and tag filters
  - Delete feed
- [ ] Add feed persistence (save to backend)
- [ ] Implement feed switching functionality

### Phase 5: Search & Bookmarks
- [ ] Implement SearchBar component
- [ ] Create search results view
- [ ] Implement search highlighting
- [ ] Create BookmarksPage
- [ ] Add bookmark toggle functionality
- [ ] Persist bookmarks to backend

### Phase 6: Polish & UX
- [ ] Mobile responsive design refinement
- [ ] Add loading states and error handling
- [ ] Implement optimistic updates for tags/bookmarks
- [ ] Add empty states (no posts, no results, etc.)
- [ ] Add toast notifications for actions
- [ ] Implement pull-to-refresh on mobile
- [ ] Add keyboard shortcuts for power users
- [ ] Performance optimization (virtualization if needed)

### Phase 7: Settings & Configuration
- [ ] Settings page UI
- [ ] Theme toggle (if implemented)
- [ ] Display preferences (post density, etc.)
- [ ] Channel management view (which channels are tracked)

## Design Guidelines

### Visual Design
- **Minimalist aesthetic**: Clean, uncluttered interface
- **Mobile-first**: Optimized for phone usage, works great on desktop
- **Typography**: Clear, readable fonts with good hierarchy
- **Spacing**: Generous whitespace between elements
- **Colors**:
  - LLM tags: Subtle blue/gray tones
  - Human tags: Warmer accent colors (orange/amber)
  - Primary actions: High contrast

### Layout
- **Mobile**: Single column, bottom navigation
- **Tablet/Desktop**: Optional sidebar for feeds/filters
- **Feed selector**: Top dropdown or slide-out drawer
- **Post cards**: Full-width on mobile, max-width container on desktop

### Interactions
- **Swipe gestures**: Consider swipe for bookmark/actions on mobile
- **Click post card**: Expand in-place or navigate to detail page
- **Tag click**: Add tag to current filter
- **Long-press**: Quick actions menu

## Performance Considerations
- Implement React Query caching strategy
  - Posts: Cache for 5 minutes
  - Tags: Cache for 10 minutes
  - Feeds: Cache indefinitely (user-modified)
- Use infinite scroll with intersection observer
- Lazy load images
- Debounce search input
- Optimize re-renders with React.memo where needed

## Accessibility
- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Nice-to-Have Features (Post-MVP)
- Tag autocomplete with frequency-based suggestions
- Bulk tag operations
- Export posts to Markdown/JSON
- PWA capabilities (offline viewing, install prompt)
- Dark/light theme toggle
- Reading time estimates
- Post statistics (most active channels, top tags)
- Tag co-occurrence visualization

## Dependencies to Install

```bash
# Core
npm install react-router-dom
npm install @tanstack/react-query
npm install axios

# shadcn/ui (requires manual setup)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add toast

# Optional utilities
npm install clsx
npm install date-fns
npm install react-intersection-observer
```

## Next Steps
1. Review and modify this plan as needed
2. Set up shadcn/ui and React Query
3. Create mock API responses for development
4. Start with Phase 1 implementation
5. Iterate with regular testing on mobile devices
