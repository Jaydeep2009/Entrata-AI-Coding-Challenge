import type { Movie } from '../types/movie';
import { formatReleaseYear, formatRating, truncateText } from '../utils/formatters';
import { getGenreNames } from '../utils/genreMap';

interface MovieCardProps {
  movie: Movie;
}

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/500x750/374151/9ca3af?text=No+Poster';

export function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : PLACEHOLDER_IMAGE;

  const releaseYear = formatReleaseYear(movie.release_date);
  const rating = formatRating(movie.vote_average);
  const genres = getGenreNames(movie.genre_ids);
  const truncatedOverview = truncateText(movie.overview, 300);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={posterUrl}
        alt={`${movie.title} poster`}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span>{releaseYear}</span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {truncatedOverview || 'No overview available.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">
            {genres}
          </span>
        </div>
      </div>
    </div>
  );
}
