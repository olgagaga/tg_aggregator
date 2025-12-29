import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelsApi } from '@/services/api';
import { toast } from 'sonner';

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.getChannels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddChannel() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { username: string; name?: string; is_active?: boolean }) =>
      channelsApi.addChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel added successfully');
    },
    onError: (error) => {
      console.error('Failed to add channel:', error);
      toast.error('Failed to add channel');
    },
  });

  return {
    addChannel: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useRemoveChannel() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (username: string) => channelsApi.removeChannel(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel removed successfully');
    },
    onError: (error) => {
      console.error('Failed to remove channel:', error);
      toast.error('Failed to remove channel');
    },
  });

  return {
    removeChannel: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useUpdateChannel(username: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { name?: string; is_active?: boolean }) =>
      channelsApi.updateChannel(username, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update channel:', error);
      toast.error('Failed to update channel');
    },
  });

  return {
    updateChannel: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
