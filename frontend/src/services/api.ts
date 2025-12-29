import axios from 'axios';
import type { Post, Feed, Tag, PaginatedResponse, Channel } from '@/types';

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
    content: 'New paper: "Attention is All You Need v2" - Researchers propose improvements to the transformer architecture with 30% better efficiency. Key insights: sparse attention patterns and adaptive computation time. The paper introduces a novel approach to reduce computational complexity while maintaining model performance. They achieve this through dynamic attention head selection and learned sparsity patterns that adapt to input complexity. Experiments on WMT translation tasks show consistent improvements across multiple language pairs. The model also demonstrates better few-shot learning capabilities and requires 40% less memory during training. This could be a game-changer for training large-scale models on limited hardware. Full implementation code and pretrained models are available on GitHub. The authors also provide extensive ablation studies showing which components contribute most to the performance gains.',
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
    console.log('[DEBUG] postsApi.getPosts: Called with params', params);
    console.log('[DEBUG] postsApi.getPosts: MOCK_DATA_ENABLED =', MOCK_DATA_ENABLED);

    if (MOCK_DATA_ENABLED) {
      console.log('[DEBUG] postsApi.getPosts: Using mock data');
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      const { limit = 20, offset = 0, tags = [] } = params;
      console.log('[DEBUG] postsApi.getPosts: Processing with', { limit, offset, tags });

      let filtered = [...mockPosts];
      console.log('[DEBUG] postsApi.getPosts: Total mock posts =', mockPosts.length);

      if (tags.length > 0) {
        filtered = filtered.filter((post) =>
          post.tags.some((tag) => tags.includes(tag.name))
        );
      }

      const paginatedPosts = filtered.slice(offset, offset + limit);
      console.log('[DEBUG] postsApi.getPosts: Returning', {
        data_length: paginatedPosts.length,
        total: filtered.length,
        has_more: offset + limit < filtered.length
      });

      const result = {
        data: paginatedPosts,
        total: filtered.length,
        has_more: offset + limit < filtered.length,
      };
      console.log('[DEBUG] postsApi.getPosts: Result =', result);
      return result;
    }

    console.log('[DEBUG] postsApi.getPosts: Making real API call');
    const response = await api.get<PaginatedResponse<Post>>('/posts', { params });
    console.log('[DEBUG] postsApi.getPosts: API response =', response.data);
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

  updateTags: async (postId: string, tags: Tag[]): Promise<Post> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const post = mockPosts.find((p) => p.id === postId);
      if (!post) throw new Error('Post not found');

      // Use the provided tags with their author_type preserved
      post.tags = tags;

      return post;
    }

    const response = await api.patch<Post>(`/posts/${postId}/tags`, {
      tags: tags.map(t => ({
        name: t.name,
        author_type: t.author_type,
      })),
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

  createTag: async (name: string): Promise<Tag> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new Error('Mock mode: Tag creation not available');
    }

    const response = await api.post<Tag>('/tags', {
      name,
      author_type: 'human',
    });
    return response.data;
  },

  deleteTag: async (name: string): Promise<void> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new Error('Mock mode: Tag deletion not available');
    }

    await api.delete(`/tags/${name}`);
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

export const channelsApi = {
  getChannels: async (): Promise<Channel[]> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    }

    const response = await api.get<Channel[]>('/channels');
    return response.data;
  },

  addChannel: async (data: { username: string; name?: string; is_active?: boolean }): Promise<Channel> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new Error('Mock mode: Channel management not available');
    }

    const response = await api.post<Channel>('/channels', {
      username: data.username,
      name: data.name || data.username,
      is_active: data.is_active ?? true,
    });
    return response.data;
  },

  removeChannel: async (username: string): Promise<void> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new Error('Mock mode: Channel management not available');
    }

    await api.delete(`/channels/${username}`);
  },

  updateChannel: async (username: string, data: { name?: string; is_active?: boolean }): Promise<Channel> => {
    if (MOCK_DATA_ENABLED) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      throw new Error('Mock mode: Channel management not available');
    }

    const response = await api.patch<Channel>(`/channels/${username}`, data);
    return response.data;
  },
};

export default api;
