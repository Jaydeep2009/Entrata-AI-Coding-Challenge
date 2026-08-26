import type { Movie, TMDBSearchResponse } from '../types/movie';
import { MovieAPIError } from '../types/movie';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const TIMEOUT_MS = 10000; // 10 seconds

class MovieAPIService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured. Please set VITE_TMDB_API_KEY in your .env file.');
    }
  }

  async searchMovies(query: string, signal?: AbortSignal): Promise<Movie[]> {
    const url = this.buildSearchURL(query);
    
    // Create timeout controller
    const timeoutId = setTimeout(() => {
      if (signal && !signal.aborted) {
        // Create a new abort event for timeout
        const controller = new AbortController();
        controller.abort();
      }
    }, TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw this.handleHTTPError(response.status);
      }

      const data: TMDBSearchResponse = await response.json();
      return this.parseMovieResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
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
    // Handle AbortError (request cancelled)
    if (error instanceof Error && error.name === 'AbortError') {
      return new MovieAPIError(
        'Request timed out. Please try again.',
        undefined,
        false,
        true
      );
    }

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

  private parseMovieResponse(response: TMDBSearchResponse): Movie[] {
    // Validate response structure
    if (!response || !Array.isArray(response.results)) {
      throw new MovieAPIError('Unexpected response from server.');
    }

    return response.results;
  }
}

// Export singleton instance
export const movieApi = new MovieAPIService();
