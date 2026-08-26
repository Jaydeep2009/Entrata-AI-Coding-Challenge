import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMovieSearch } from './useMovieSearch';
import { movieApi } from '../services/movieApi';

vi.mock('../services/movieApi');

describe('useMovieSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useMovieSearch());

    expect(result.current.movies).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasSearched).toBe(false);
  });

  it('updates state on successful search', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Test Movie',
        poster_path: '/test.jpg',
        release_date: '2024-01-01',
        vote_average: 7.5,
        overview: 'Test overview',
        genre_ids: [28],
      },
    ];

    vi.mocked(movieApi.searchMovies).mockResolvedValueOnce(mockMovies);

    const { result } = renderHook(() => useMovieSearch());

    await act(async () => {
      await result.current.searchMovies('test');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.movies).toEqual(mockMovies);
    expect(result.current.hasSearched).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('updates state on search error', async () => {
    const mockError = new Error('API Error');
    vi.mocked(movieApi.searchMovies).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useMovieSearch());

    await act(async () => {
      await result.current.searchMovies('test');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBe(null);
    expect(result.current.movies).toEqual([]);
  });

  it('prevents duplicate queries', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Test Movie',
        poster_path: '/test.jpg',
        release_date: '2024-01-01',
        vote_average: 7.5,
        overview: 'Test overview',
        genre_ids: [28],
      },
    ];

    vi.mocked(movieApi.searchMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useMovieSearch());

    // First search
    await act(async () => {
      await result.current.searchMovies('test');
    });
    
    await waitFor(() => expect(result.current.hasSearched).toBe(true));

    // Second search with same query
    await act(async () => {
      await result.current.searchMovies('test');
    });

    // API should only be called once
    expect(movieApi.searchMovies).toHaveBeenCalledTimes(1);
  });

  it('clears error when clearError is called', async () => {
    const mockError = new Error('API Error');
    vi.mocked(movieApi.searchMovies).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useMovieSearch());

    await act(async () => {
      await result.current.searchMovies('test');
    });

    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});
