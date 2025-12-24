export interface Post {
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

export interface Tag {
  name: string;
  author_type: 'llm' | 'human';
  created_at: string;
}

export interface Feed {
  id: string;
  name: string;
  tag_filters: string[];
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
