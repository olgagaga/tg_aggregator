import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksApi } from '@/services/api';
import { toast } from 'sonner';

export function useBookmarks(limit = 20, page = 1) {
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['bookmarks', { page }],
    queryFn: () =>
      bookmarksApi.getBookmarks({
        limit,
        offset,
      }),
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  const addBookmark = useMutation({
    mutationFn: (postId: string) => bookmarksApi.addBookmark(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Added to bookmarks');
    },
    onError: () => {
      toast.error('Failed to add bookmark');
    },
  });

  const removeBookmark = useMutation({
    mutationFn: (postId: string) => bookmarksApi.removeBookmark(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Removed from bookmarks');
    },
    onError: () => {
      toast.error('Failed to remove bookmark');
    },
  });

  return {
    addBookmark: addBookmark.mutate,
    removeBookmark: removeBookmark.mutate,
    isLoading: addBookmark.isPending || removeBookmark.isPending,
  };
}
