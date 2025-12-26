import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';
import { usePosts } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import { AlertCircle } from 'lucide-react';

interface PostListProps {
  feedId?: string;
  tags?: string[];
  search?: string;
  onTagClick?: (tagName: string) => void;
}

export default function PostList({ feedId, tags, search, onTagClick }: PostListProps) {
  console.log('[DEBUG] PostList: Rendering PostList', { feedId, tags, search });
  const [currentPage, setCurrentPage] = useState(1);
  console.log('[DEBUG] PostList: currentPage =', currentPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    console.log('[DEBUG] PostList: useEffect triggered - resetting to page 1');
    setCurrentPage(1);
  }, [feedId, tags?.join(','), search]);

  console.log('[DEBUG] PostList: Calling usePosts with', { feed_id: feedId, tags, search, page: currentPage });
  const {
    data,
    isLoading,
    isError,
    error,
  } = usePosts({ feed_id: feedId, tags, search, page: currentPage });
  console.log('[DEBUG] PostList: usePosts returned', { data, isLoading, isError });

  // Initial loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Failed to load posts</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const posts = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-2">
        <p className="text-lg font-medium">No posts found</p>
        <p className="text-sm text-muted-foreground">
          {search
            ? 'Try adjusting your search query'
            : tags && tags.length > 0
            ? 'Try removing some tag filters'
            : 'Check back later for new posts'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onTagClick={onTagClick}
        />
      ))}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        disabled={isLoading}
      />
    </div>
  );
}
