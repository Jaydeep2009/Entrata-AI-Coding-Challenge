import type { Movie } from '../types/movie';
import { MovieAPIError } from '../types/movie';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const TIMEOUT_MS = 10000; // 10 seconds

class MovieAPIService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY || '';
  }

  async searchMovies(query: string, signal?: AbortSignal): Promise<Movie[]> {
    // Check API key at runtime, not during initialization
    if (!this.apiKey) {
      console.error('[MovieAPI] Missing API key');
      throw new MovieAPIError(
        'TMDB API key is not configured. Please set VITE_TMDB_API_KEY in your .env file.',
        undefined,
        false,
        false,
        false
      );
    }

    console.log(`[MovieAPI] Searching for: "${query}"`);
    const url = this.buildSearchURL(query);
    
    // Create a timeout controller that will actually abort the fetch
    const timeoutController = new AbortController();
    let isTimedOut = false;
    
    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      console.warn('[MovieAPI] Request timed out after 10s');
      timeoutController.abort();
    }, TIMEOUT_MS);

    // If there's an external signal, listen to it and abort timeout controller
    if (signal) {
      signal.addEventListener('abort', () => {
        console.log('[MovieAPI] Request cancelled by user');
        timeoutController.abort();
      });
    }

    try {
      const response = await fetch(url, { signal: timeoutController.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[MovieAPI] HTTP error: ${response.status}`);
        throw this.handleHTTPError(response.status);
      }

      const data = await response.json();
      const movies = this.parseMovieResponse(data);
      console.log(`[MovieAPI] Found ${movies.length} movies`);
      return movies;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Distinguish timeout from intentional cancellation
      if (error instanceof Error && error.name === 'AbortError') {
        // If we marked it as timeout, throw timeout error
        if (isTimedOut) {
          throw new MovieAPIError(
            'Request timed out. Please try again.',
            undefined,
            false,
            true
          );
        }
        // Otherwise it's intentional cancellation - rethrow as-is
        throw error;
      }
      
      throw this.handleFetchError(error);
    }
  }

  private buildSearchURL(query: string): string {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      query: query,
      language: 'en-US',
      include_adult: 'false',
      page: '1',
    });
    
    return `${API_BASE_URL}/search/movie?${params.toString()}`;
  }

  private handleHTTPError(status: number): MovieAPIError {
    switch (status) {
      case 401:
        return new MovieAPIError(
          'Invalid API key. Please check your configuration.',
          401
        );
      case 404:
        return new MovieAPIError(
          'No movies found matching your search.',
          404
        );
      case 429:
        return new MovieAPIError(
          'Too many requests. Please wait a moment and try again.',
          429,
          false,
          false,
          true
        );
      case 500:
      case 502:
      case 503:
        return new MovieAPIError(
          'Server error. Please try again later.',
          status
        );
      default:
        return new MovieAPIError(
          'Unexpected response from server.',
          status
        );
    }
  }

  private handleFetchError(error: unknown): MovieAPIError {
    // Handle network errors (no response)
    if (error instanceof TypeError) {
      return new MovieAPIError(
        'Unable to connect. Check your internet connection.',
        undefined,
        true
      );
    }

    // Handle other errors
    if (error instanceof Error) {
      return new MovieAPIError(error.message);
    }

    return new MovieAPIError('An unexpected error occurred.');
  }

  private parseMovieResponse(response: unknown): Movie[] {
    // Validate response structure
    if (!response || typeof response !== 'object') {
      throw new MovieAPIError('Unexpected response from server.');
    }

    const data = response as Record<string, unknown>;

    if (!Array.isArray(data.results)) {
      throw new MovieAPIError('Unexpected response from server.');
    }

    // Validate and sanitize each movie entry
    return data.results
      .filter((item): item is Record<string, unknown> => 
        typeof item === 'object' && item !== null
      )
      .map((item) => this.parseMovie(item))
      .filter((movie): movie is Movie => movie !== null);
  }

  private parseMovie(item: Record<string, unknown>): Movie | null {
    // Validate required fields
    if (typeof item.id !== 'number' || !item.id) {
      return null;
    }

    if (typeof item.title !== 'string' || !item.title) {
      return null;
    }

    // Return movie with validated fields and sensible defaults
    return {
      id: item.id,
      title: item.title,
      poster_path: typeof item.poster_path === 'string' ? item.poster_path : null,
      release_date: typeof item.release_date === 'string' ? item.release_date : '',
      vote_average: typeof item.vote_average === 'number' ? item.vote_average : 0,
      overview: typeof item.overview === 'string' ? item.overview : '',
      genre_ids: Array.isArray(item.genre_ids) 
        ? item.genre_ids.filter((id): id is number => typeof id === 'number')
        : [],
    };
  }
}

// Export singleton instance
export const movieApi = new MovieAPIService();
