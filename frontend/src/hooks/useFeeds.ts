import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedsApi } from '@/services/api';
import { toast } from 'sonner';
import type { Feed } from '@/types';

export function useFeeds() {
  return useQuery({
    queryKey: ['feeds'],
    queryFn: feedsApi.getFeeds,
    staleTime: Infinity, // Feeds don't change often, cache indefinitely
  });
}

export function useCreateFeed() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { name: string; tag_filters: string[] }) =>
      feedsApi.createFeed(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      toast.success('Feed created successfully');
    },
    onError: (error) => {
      console.error('Failed to create feed:', error);
      toast.error('Failed to create feed');
    },
  });

  return {
    createFeed: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useUpdateFeed(feedId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { name?: string; tag_filters?: string[] }) =>
      feedsApi.updateFeed(feedId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      toast.success('Feed updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update feed:', error);
      toast.error('Failed to update feed');
    },
  });

  return {
    updateFeed: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useDeleteFeed() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (feedId: string) => feedsApi.deleteFeed(feedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      toast.success('Feed deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete feed:', error);
      toast.error('Failed to delete feed');
    },
  });

  return {
    deleteFeed: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
