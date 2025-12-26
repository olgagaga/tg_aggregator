import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi, postsApi } from '@/services/api';
import { toast } from 'sonner';
import type { Tag } from '@/types';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getTags,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdatePostTags(postId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (tags: Tag[]) => postsApi.updateTags(postId, tags),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Tags updated successfully');
    },
    onError: (error) => {
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
