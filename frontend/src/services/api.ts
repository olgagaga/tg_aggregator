import axios from 'axios';
import type { Post, Feed, Tag, PaginatedResponse } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for development
const MOCK_DATA_ENABLED = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mockPosts: Post[] = [
  {
    id: '1',
    channel_name: 'ML Research Daily',
    channel_username: 'mlresearch',
    content: 'New paper: "Attention is All You Need v2" - Researchers propose improvements to the transformer architecture with 30% better efficiency. Key insights: sparse attention patterns and adaptive computation time. Full paper: arxiv.org/...',
    media_urls: [],
    original_url: 'https://t.me/mlresearch/1234',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tags: [
      { name: 'transformers', author_type: 'llm', created_at: new Date().toISOString() },
      { name: 'research-paper', author_type: 'llm', created_at: new Date().toISOString() },
      { name: 'important', author_type: 'human', created_at: new Date().toISOString() },
    ],
    is_bookmarked: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    channel_name: 'Deep Learning News',
    channel_username: 'dlnews',
    content: 'OpenAI releases new model checkpoint with improved reasoning capabilities. Benchmarks show significant improvements on mathematical reasoning tasks.',
    media_urls: ['https://via.placeholder.com/600x400'],
    original_url: 'https://t.me/dlnews/5678',
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    tags: [
      { name: 'llm', author_type: 'llm', created_at: new Date().toISOString() },
      { name: 'news', author_type: 'llm', created_at: new Date().toISOString() },
      { name: 'openai', author_type: 'llm', created_at: new Date().toISOString() },
    ],
    is_bookmarked: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    channel_name: 'AI Engineering',
    channel_username: 'aieng',
    content: 'Tutorial: How to fine-tune LLaMA 3 on custom datasets. Step-by-step guide with code examples and best practices for data preparation.',
    media_urls: [],
    original_url: 'https://t.me/aieng/9012',
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tags: [
      { name: 'tutorial', author_type: 'llm', created_at: new Date().toISOString() },
      { name: 'fine-tuning', author_type: 'llm', created_at: new Date().toISOString() },
      { name: 'llama', author_type: 'llm', created_at: new Date().toISOString() },
      { name: 'educational', author_type: 'human', created_at: new Date().toISOString() },
    ],
    is_bookmarked: false,
    created_at: new Date().toISOString(),
  },
];

const mockFeeds: Feed[] = [
  {
    id: 'all',
    name: 'All Posts',
    tag_filters: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '1',
    name: 'Research Papers',
    tag_filters: ['research-paper', 'arxiv'],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Tutorials',
    tag_filters: ['tutorial', 'educational'],
    created_at: new Date().toISOString(),
  },
];

// API Functions
export const postsApi = {
  getPosts: async (params: {
    limit?: number;
    offset?: number;
    feed_id?: string;
    tags?: string[];
    search?: string;
  }): Promise<PaginatedResponse<Post>> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      const { limit = 20, offset = 0, tags = [] } = params;

      let filtered = [...mockPosts];

      if (tags.length > 0) {
        filtered = filtered.filter((post) =>
          post.tags.some((tag) => tags.includes(tag.name))
        );
      }

      const paginatedPosts = filtered.slice(offset, offset + limit);

      return {
        data: paginatedPosts,
        total: filtered.length,
        has_more: offset + limit < filtered.length,
      };
    }

    const response = await api.get<PaginatedResponse<Post>>('/posts', { params });
    return response.data;
  },

  getPost: async (id: string): Promise<Post> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const post = mockPosts.find((p) => p.id === id);
      if (!post) throw new Error('Post not found');
      return post;
    }

    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  updateTags: async (postId: string, tags: string[]): Promise<Post> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const post = mockPosts.find((p) => p.id === postId);
      if (!post) throw new Error('Post not found');

      post.tags = tags.map((name) => ({
        name,
        author_type: 'human' as const,
        created_at: new Date().toISOString(),
      }));

      return post;
    }

    const response = await api.patch<Post>(`/posts/${postId}/tags`, {
      tags,
      author_type: 'human',
    });
    return response.data;
  },
};

export const feedsApi = {
  getFeeds: async (): Promise<Feed[]> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockFeeds;
    }

    const response = await api.get<{ feeds: Feed[] }>('/feeds');
    return response.data.feeds;
  },

  createFeed: async (data: { name: string; tag_filters: string[] }): Promise<Feed> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newFeed: Feed = {
        id: String(mockFeeds.length + 1),
        name: data.name,
        tag_filters: data.tag_filters,
        created_at: new Date().toISOString(),
      };
      mockFeeds.push(newFeed);
      return newFeed;
    }

    const response = await api.post<Feed>('/feeds', data);
    return response.data;
  },

  updateFeed: async (id: string, data: { name?: string; tag_filters?: string[] }): Promise<Feed> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const feed = mockFeeds.find((f) => f.id === id);
      if (!feed) throw new Error('Feed not found');

      if (data.name) feed.name = data.name;
      if (data.tag_filters) feed.tag_filters = data.tag_filters;

      return feed;
    }

    const response = await api.patch<Feed>(`/feeds/${id}`, data);
    return response.data;
  },

  deleteFeed: async (id: string): Promise<void> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = mockFeeds.findIndex((f) => f.id === id);
      if (index !== -1) {
        mockFeeds.splice(index, 1);
      }
      return;
    }

    await api.delete(`/feeds/${id}`);
  },
};

export const tagsApi = {
  getTags: async (): Promise<Array<{ name: string; count: number; source: 'llm' | 'human' }>> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const tagCounts: Record<string, { count: number; source: 'llm' | 'human' }> = {};

      mockPosts.forEach((post) => {
        post.tags.forEach((tag) => {
          if (!tagCounts[tag.name]) {
            tagCounts[tag.name] = { count: 0, source: tag.author_type };
          }
          tagCounts[tag.name].count++;
        });
      });

      return Object.entries(tagCounts).map(([name, data]) => ({
        name,
        count: data.count,
        source: data.source,
      }));
    }

    const response = await api.get<{ tags: Array<{ name: string; count: number; source: 'llm' | 'human' }> }>('/tags');
    return response.data.tags;
  },
};

export const searchApi = {
  search: async (query: string, params: { limit?: number; offset?: number }): Promise<PaginatedResponse<Post>> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const { limit = 20, offset = 0 } = params;

      const filtered = mockPosts.filter((post) =>
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.channel_name.toLowerCase().includes(query.toLowerCase())
      );

      const paginatedPosts = filtered.slice(offset, offset + limit);

      return {
        data: paginatedPosts,
        total: filtered.length,
        has_more: offset + limit < filtered.length,
      };
    }

    const response = await api.get<PaginatedResponse<Post>>('/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },
};

export const bookmarksApi = {
  addBookmark: async (postId: string): Promise<void> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const post = mockPosts.find((p) => p.id === postId);
      if (post) post.is_bookmarked = true;
      return;
    }

    await api.post(`/bookmarks/${postId}`);
  },

  removeBookmark: async (postId: string): Promise<void> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const post = mockPosts.find((p) => p.id === postId);
      if (post) post.is_bookmarked = false;
      return;
    }

    await api.delete(`/bookmarks/${postId}`);
  },

  getBookmarks: async (params: { limit?: number; offset?: number }): Promise<PaginatedResponse<Post>> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const { limit = 20, offset = 0 } = params;

      const bookmarked = mockPosts.filter((p) => p.is_bookmarked);
      const paginatedPosts = bookmarked.slice(offset, offset + limit);

      return {
        data: paginatedPosts,
        total: bookmarked.length,
        has_more: offset + limit < bookmarked.length,
      };
    }

    const response = await api.get<PaginatedResponse<Post>>('/bookmarks', { params });
    return response.data;
  },
};

export default api;
