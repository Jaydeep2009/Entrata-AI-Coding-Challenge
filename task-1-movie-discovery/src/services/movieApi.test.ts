import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { movieApi } from './movieApi';
import { MovieAPIError } from '../types/movie';

// Mock fetch globally
global.fetch = vi.fn();

describe('MovieAPI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('successfully fetches and parses movies', async () => {
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 1,
          title: 'Test Movie',
          poster_path: '/test.jpg',
          release_date: '2024-01-01',
          vote_average: 7.5,
          overview: 'Test overview',
          genre_ids: [28, 12],
        },
      ],
      total_results: 1,
      total_pages: 1,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const results = await movieApi.searchMovies('test');

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Movie');
  });

  it('returns empty array for no results', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_results: 0,
      total_pages: 0,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const results = await movieApi.searchMovies('nonexistent');

    expect(results).toHaveLength(0);
  });

  it('handles 401 authentication error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    await expect(movieApi.searchMovies('test')).rejects.toThrow(
      MovieAPIError
    );
  });

  it('handles 404 not found error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(movieApi.searchMovies('test')).rejects.toThrow('No movies found');
  });

  it('handles 429 rate limit error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    try {
      await movieApi.searchMovies('test');
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(MovieAPIError);
      expect((error as MovieAPIError).message).toContain('Too many requests');
    }
  });

  it('handles 500 server error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(movieApi.searchMovies('test')).rejects.toThrow('Server error');
  });

  it('handles network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(
      new TypeError('Failed to fetch')
    );

    try {
      await movieApi.searchMovies('test');
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(MovieAPIError);
      expect((error as MovieAPIError).isNetworkError).toBe(true);
    }
  });

  it('handles malformed response with missing results', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'response' }),
    } as Response);

    await expect(movieApi.searchMovies('test')).rejects.toThrow(
      'Unexpected response from server'
    );
  });

  it('handles malformed response with null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    } as Response);

    await expect(movieApi.searchMovies('test')).rejects.toThrow(
      'Unexpected response from server'
    );
  });

  it('filters out malformed movie entries with missing required fields', async () => {
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 1,
          title: 'Valid Movie',
          poster_path: '/test.jpg',
          release_date: '2024-01-01',
          vote_average: 7.5,
          overview: 'Test overview',
          genre_ids: [28],
        },
        {
          // Missing id
          title: 'Invalid Movie 1',
        },
        {
          id: 2,
          // Missing title
          poster_path: '/test2.jpg',
        },
        {
          id: 3,
          title: 'Valid Movie 2',
          // Missing optional fields - should use defaults
        },
      ],
      total_results: 4,
      total_pages: 1,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const results = await movieApi.searchMovies('test');

    // Should only return 2 valid movies
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Valid Movie');
    expect(results[1].title).toBe('Valid Movie 2');
    
    // Check defaults for missing optional fields
    expect(results[1].poster_path).toBe(null);
    expect(results[1].release_date).toBe('');
    expect(results[1].vote_average).toBe(0);
    expect(results[1].overview).toBe('');
    expect(results[1].genre_ids).toEqual([]);
  });

  it('handles malformed genre_ids gracefully', async () => {
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 1,
          title: 'Test Movie',
          genre_ids: [28, 'invalid', 12, null, 14],
        },
      ],
      total_results: 1,
      total_pages: 1,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const results = await movieApi.searchMovies('test');

    // Should filter out invalid genre IDs
    expect(results[0].genre_ids).toEqual([28, 12, 14]);
  });

  it('uses HTTPS URLs', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_results: 0,
      total_pages: 0,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await movieApi.searchMovies('test');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\//),
      expect.any(Object)
    );
  });
});
