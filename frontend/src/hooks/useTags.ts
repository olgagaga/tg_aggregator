import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi, postsApi } from '@/services/api';
import { toast } from 'sonner';
import type { Tag, Post, PaginatedResponse } from '@/types';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getTags,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (name: string) => tagsApi.createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
    },
    onError: (error) => {
      console.error('Failed to create tag:', error);
      toast.error('Failed to create tag');
    },
  });

  return {
    createTag: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (name: string) => tagsApi.deleteTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete tag:', error);
      toast.error('Failed to delete tag');
    },
  });

  return {
    deleteTag: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useUpdatePostTags(postId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (tags: Tag[]) => postsApi.updateTags(postId, tags),
    // Optimistic update
    onMutate: async (newTags: Tag[]) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['search'] });

      // Snapshot previous values
      const previousPosts = queryClient.getQueriesData({ queryKey: ['posts'] });
      const previousSearch = queryClient.getQueriesData({ queryKey: ['search'] });

      // Optimistically update posts
      queryClient.setQueriesData<PaginatedResponse<Post>>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((post) =>
              post.id === postId ? { ...post, tags: newTags } : post
            ),
          };
        }
      );

      // Optimistically update search results
      queryClient.setQueriesData<PaginatedResponse<Post>>(
        { queryKey: ['search'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((post) =>
              post.id === postId ? { ...post, tags: newTags } : post
            ),
          };
        }
      );

      return { previousPosts, previousSearch };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Tags updated successfully');
    },
    onError: (error, _newTags, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousSearch) {
        context.previousSearch.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to update tags:', error);
      toast.error('Failed to update tags');
    },
  });

  return {
    updateTags: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
