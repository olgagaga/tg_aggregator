import { useState } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import PostCard from '@/components/posts/PostCard';
import PostSkeleton from '@/components/posts/PostSkeleton';
import { Pagination } from '@/components/ui/Pagination';
import { AlertCircle, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BookmarksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, error } = useBookmarks(20, currentPage);

  const posts = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Bookmarks</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Bookmarks</h1>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Failed to load bookmarks</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Bookmarks</h1>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Bookmark className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No bookmarks yet</h3>
            <p className="text-sm text-muted-foreground">
              Posts you bookmark will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}
