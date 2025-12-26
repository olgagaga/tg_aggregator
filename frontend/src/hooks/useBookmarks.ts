import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksApi } from '@/services/api';
import { toast } from 'sonner';
import type { Post, PaginatedResponse } from '@/types';

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
    // Optimistic update
    onMutate: async (postId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });

      // Snapshot previous values
      const previousPosts = queryClient.getQueriesData({ queryKey: ['posts'] });
      const previousBookmarks = queryClient.getQueriesData({ queryKey: ['bookmarks'] });

      // Optimistically update posts
      queryClient.setQueriesData<PaginatedResponse<Post>>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((post) =>
              post.id === postId ? { ...post, is_bookmarked: true } : post
            ),
          };
        }
      );

      return { previousPosts, previousBookmarks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Added to bookmarks');
    },
    onError: (_err, _postId, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to add bookmark');
    },
  });

  const removeBookmark = useMutation({
    mutationFn: (postId: string) => bookmarksApi.removeBookmark(postId),
    // Optimistic update
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });

      const previousPosts = queryClient.getQueriesData({ queryKey: ['posts'] });
      const previousBookmarks = queryClient.getQueriesData({ queryKey: ['bookmarks'] });

      // Optimistically update posts
      queryClient.setQueriesData<PaginatedResponse<Post>>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((post) =>
              post.id === postId ? { ...post, is_bookmarked: false } : post
            ),
          };
        }
      );

      // Optimistically remove from bookmarks list
      queryClient.setQueriesData<PaginatedResponse<Post>>(
        { queryKey: ['bookmarks'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((post) => post.id !== postId),
            total: old.total - 1,
          };
        }
      );

      return { previousPosts, previousBookmarks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Removed from bookmarks');
    },
    onError: (_err, _postId, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousBookmarks) {
        context.previousBookmarks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to remove bookmark');
    },
  });

  return {
    addBookmark: addBookmark.mutate,
    removeBookmark: removeBookmark.mutate,
    isLoading: addBookmark.isPending || removeBookmark.isPending,
  };
}
