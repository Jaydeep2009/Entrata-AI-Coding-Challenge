import { describe, it, expect, beforeEach, vi } from 'vitest';
import { movieApi } from './movieApi';
import { MovieAPIError } from '../types/movie';

// Mock fetch globally
global.fetch = vi.fn();

describe('MovieAPI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('handles 429 rate limit error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    await expect(movieApi.searchMovies('test')).rejects.toThrow('Too many requests');
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

  it('handles malformed response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'response' }),
    } as Response);

    await expect(movieApi.searchMovies('test')).rejects.toThrow(
      'Unexpected response from server'
    );
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
