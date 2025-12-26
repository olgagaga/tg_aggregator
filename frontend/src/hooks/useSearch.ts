import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/services/api';
import type { Post } from '@/types';

export function useSearch(query: string, enabled: boolean = true) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery, { limit: 20, offset: 0 }),
    enabled: enabled && debouncedQuery.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useInfiniteSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // For now, return a simple paginated search
  // Can be enhanced with useInfiniteQuery later if needed
  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery, { limit: 50, offset: 0 }),
    enabled: debouncedQuery.length > 0,
    staleTime: 30 * 1000,
  });
}
