import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/services/api';
import type { Post } from '@/types';

interface UsePostsParams {
  feed_id?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  page?: number;
}

export function usePosts({ feed_id, tags, search, limit = 20, page = 1 }: UsePostsParams = {}) {
  console.log('[DEBUG] usePosts: Called with', { feed_id, tags, search, limit, page });
  const offset = (page - 1) * limit;
  console.log('[DEBUG] usePosts: Calculated offset =', offset);

  // Build query key with only defined values
  const queryKey = ['posts', page, feed_id, tags?.join(','), search].filter(v => v !== undefined && v !== '');
  console.log('[DEBUG] usePosts: Query key =', JSON.stringify(queryKey));

  const queryFn = async () => {
    console.log('[DEBUG] usePosts: queryFn STARTED');
    try {
      const result = await postsApi.getPosts({
        limit,
        offset,
        feed_id,
        tags,
        search,
      });
      console.log('[DEBUG] usePosts: queryFn COMPLETED with result', result);
      return result;
    } catch (error) {
      console.error('[DEBUG] usePosts: queryFn FAILED with error', error);
      throw error;
    }
  };

  console.log('[DEBUG] usePosts: About to call useQuery');
  const result = useQuery({
    queryKey,
    queryFn,
    enabled: true,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  console.log('[DEBUG] usePosts: Returning result', {
    isLoading: result.isLoading,
    isPending: result.isPending,
    isFetching: result.isFetching,
    isError: result.isError,
    status: result.status,
    fetchStatus: result.fetchStatus,
    data: result.data
  });
  return result;
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPost(id),
  });
}

export function useUpdatePostTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, tags }: { postId: string; tags: string[] }) =>
      postsApi.updateTags(postId, tags),
    onSuccess: (updatedPost) => {
      // Update the post in all relevant queries
      queryClient.setQueryData<Post>(['post', updatedPost.id], updatedPost);

      // Invalidate posts list to refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
