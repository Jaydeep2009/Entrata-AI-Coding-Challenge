import { useState, useRef, useEffect } from 'react';
import type { Movie } from '../types/movie';
import { MovieAPIError } from '../types/movie';
import { movieApi } from '../services/movieApi';

interface UseMovieSearchReturn {
  movies: Movie[];
  loading: boolean;
  error: MovieAPIError | null;
  hasSearched: boolean;
  searchMovies: (query: string) => Promise<void>;
  clearError: () => void;
}

export function useMovieSearch(): UseMovieSearchReturn {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<MovieAPIError | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchMovies = async (query: string) => {
    // Prevent duplicate queries
    if (query === lastQuery && hasSearched) {
      console.log('[useMovieSearch] Skipping duplicate query:', query);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      console.log('[useMovieSearch] Cancelling previous request');
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const results = await movieApi.searchMovies(
        query,
        abortControllerRef.current.signal
      );
      
      // Only update state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        console.log('[useMovieSearch] Search successful, updating state');
        setMovies(results);
        setHasSearched(true);
        setLastQuery(query);
      }
    } catch (err) {
      // Don't show error for intentionally cancelled requests
      if (err instanceof Error && err.name === 'AbortError') {
        // AbortErrors from intentional cancellation are silently ignored
        console.log('[useMovieSearch] Request cancelled, not showing error');
        return;
      }
      
      console.error('[useMovieSearch] Search failed:', err);
      if (err instanceof MovieAPIError) {
        // Only show timeout errors, not cancellation errors
        setError(err);
      } else {
        setError(new MovieAPIError('An unexpected error occurred.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    movies,
    loading,
    error,
    hasSearched,
    searchMovies,
    clearError,
  };
}
