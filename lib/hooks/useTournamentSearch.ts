'use client';

import { useState, useCallback, useRef } from 'react';
import { Tournament, TournamentSearchParams } from '@/lib/types/tournament';

interface SearchResponse {
  tournaments: Tournament[];
  total: number;
  hasMore: boolean;
  pagination: {
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
  };
  query: {
    text: string;
    filters: TournamentSearchParams;
  };
  metadata: {
    search_time: number;
    results_ranked: boolean;
  };
}

interface SearchSuggestion {
  id: string;
  name: string;
  location?: string;
  type?: string;
  date?: string;
  status?: string;
  registration_open?: boolean;
  category: 'tournament' | 'location' | 'type';
}

interface UseTournamentSearchReturn {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  pagination: SearchResponse['pagination'] | null;
  suggestions: SearchSuggestion[];
  suggestionsLoading: boolean;
  search: (params: TournamentSearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  reset: () => void;
}

export function useTournamentSearch(): UseTournamentSearchReturn {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [pagination, setPagination] = useState<SearchResponse['pagination'] | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  const lastSearchParams = useRef<TournamentSearchParams>({});
  const abortController = useRef<AbortController | null>(null);
  const suggestionsCache = useRef<Map<string, { data: SearchSuggestion[]; timestamp: number }>>(new Map());

  const search = useCallback(async (params: TournamentSearchParams) => {
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    
    setLoading(true);
    setError(null);
    lastSearchParams.current = { ...params };

    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/tournaments/search?${searchParams.toString()}`, {
        signal: abortController.current.signal
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      
      setTournaments(data.tournaments);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPagination(data.pagination);

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Search failed');
        console.error('Tournament search error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !pagination) return;

    setLoading(true);
    setError(null);

    try {
      const nextOffset = pagination.offset + pagination.limit;
      const params = {
        ...lastSearchParams.current,
        offset: nextOffset
      };

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/tournaments/search?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Load more failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      
      setTournaments(prev => [...prev, ...data.tournaments]);
      setHasMore(data.hasMore);
      setPagination(data.pagination);

    } catch (err: any) {
      setError(err.message || 'Load more failed');
      console.error('Load more error:', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, pagination]);

  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Check cache first (5 minute TTL)
    const cacheKey = query.toLowerCase().trim();
    const cached = suggestionsCache.current.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < 5 * 60 * 1000) {
      setSuggestions(cached.data);
      return;
    }

    setSuggestionsLoading(true);

    try {
      const response = await fetch(`/api/tournaments/search?query=${encodeURIComponent(query)}&suggestions=true&limit=8`);

      if (!response.ok) {
        throw new Error(`Suggestions failed: ${response.statusText}`);
      }

      const data = await response.json();
      const suggestions = data.suggestions || [];
      
      // Cache the results
      suggestionsCache.current.set(cacheKey, {
        data: suggestions,
        timestamp: now
      });
      
      // Clean old cache entries (keep max 50 entries)
      if (suggestionsCache.current.size > 50) {
        const entries = Array.from(suggestionsCache.current.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        suggestionsCache.current.clear();
        entries.slice(0, 30).forEach(([key, value]) => {
          suggestionsCache.current.set(key, value);
        });
      }
      
      setSuggestions(suggestions);

    } catch (err: any) {
      console.error('Suggestions error:', err);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    setTournaments([]);
    setLoading(false);
    setError(null);
    setTotal(0);
    setHasMore(false);
    setPagination(null);
    setSuggestions([]);
    setSuggestionsLoading(false);
    lastSearchParams.current = {};
  }, []);

  return {
    tournaments,
    loading,
    error,
    total,
    hasMore,
    pagination,
    suggestions,
    suggestionsLoading,
    search,
    loadMore,
    getSuggestions,
    reset
  };
}