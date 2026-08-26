import type { Movie } from '../types/movie';
import { formatReleaseYear, formatRating, truncateText } from '../utils/formatters';
import { getGenreNames } from '../utils/genreMap';

interface MovieCardProps {
  movie: Movie;
}

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/500x750/1e293b/64748b?text=No+Poster';

export function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : PLACEHOLDER_IMAGE;

  const releaseYear = formatReleaseYear(movie.release_date);
  const rating = formatRating(movie.vote_average);
  const genres = getGenreNames(movie.genre_ids).split(', ').slice(0, 3);
  const truncatedOverview = truncateText(movie.overview, 150);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all group">
      <div className="relative overflow-hidden">
        <img
          src={posterUrl}
          alt={`${movie.title} poster`}
          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <span className="text-yellow-400">⭐</span>
          <span className="text-white font-semibold text-sm">{rating}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <span>{releaseYear}</span>
        </div>

        <p className="text-sm text-slate-300 mb-4 line-clamp-3">
          {truncatedOverview || 'No overview available.'}
        </p>

        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-500/30"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
