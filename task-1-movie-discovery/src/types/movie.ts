export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface TMDBSearchResponse {
  page: number;
  results: Movie[];
  total_results: number;
  total_pages: number;
}

export class MovieAPIError extends Error {
  statusCode?: number;
  isNetworkError: boolean;
  isTimeout: boolean;
  isRateLimit: boolean;

  constructor(
    message: string,
    statusCode?: number,
    isNetworkError: boolean = false,
    isTimeout: boolean = false,
    isRateLimit: boolean = false
  ) {
    super(message);
    this.name = 'MovieAPIError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
    this.isRateLimit = isRateLimit;
  }
}
