import { useMovieSearch } from './hooks/useMovieSearch';
import { SearchBar } from './components/SearchBar';
import { MovieGrid } from './components/MovieGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { EmptyState } from './components/EmptyState';

// Minimal debug logger
const log = {
  search: (query: string) => console.log(`[Movie Discovery] Searching for: "${query}"`),
  results: (count: number) => console.log(`[Movie Discovery] Found ${count} movies`),
  error: (message: string) => console.error(`[Movie Discovery] Error: ${message}`),
};

function App() {
  const { movies, loading, error, hasSearched, searchMovies, clearError } =
    useMovieSearch();

  const handleSearch = async (query: string) => {
    log.search(query);
    await searchMovies(query);
    
    if (movies.length > 0) {
      log.results(movies.length);
    }
  };

  const handleRetry = () => {
    clearError();
  };

  // Log errors
  if (error) {
    log.error(error.message);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with logo */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎬</span>
            <h1 className="text-xl font-bold text-white">Movie Discovery</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
            <span>⭐</span>
            <span>Popular Movies</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        {!hasSearched && (
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Discover Your Next{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Favorite Movie
              </span>
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Search thousands of movies and find your perfect match
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 max-w-3xl mx-auto">
          <SearchBar onSearch={handleSearch} disabled={loading} />
          {!hasSearched && (
            <div className="text-center mt-4 text-sm text-slate-400">
              <span className="mr-2">⚡</span>
              Try searching for:{' '}
              <button
                onClick={() => handleSearch('Inception')}
                className="text-purple-400 hover:text-purple-300 transition-colors mx-1"
              >
                Inception
              </button>
              ,{' '}
              <button
                onClick={() => handleSearch('The Dark Knight')}
                className="text-purple-400 hover:text-purple-300 transition-colors mx-1"
              >
                The Dark Knight
              </button>
              ,{' '}
              <button
                onClick={() => handleSearch('Interstellar')}
                className="text-purple-400 hover:text-purple-300 transition-colors mx-1"
              >
                Interstellar
              </button>
            </div>
          )}
        </div>

        {/* Welcome Card */}
        {!hasSearched && !loading && !error && (
          <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <span className="text-4xl">✨</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Welcome to Movie Discovery!
                </h3>
                <p className="text-slate-300">
                  Search for any movie title to get started. We'll show you ratings, overview, genres and more.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main>
          {loading && <LoadingSpinner message="Searching for movies..." />}

          {!loading && error && (
            <ErrorMessage error={error} onRetry={handleRetry} />
          )}

          {!loading && !error && hasSearched && movies.length === 0 && (
            <EmptyState
              message="No movies found"
              isNoResults={true}
            />
          )}

          {!loading && !error && movies.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🎬</span>
                  <span>Search Results</span>
                </h2>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View All →
                </button>
              </div>
              <MovieGrid movies={movies} />
            </>
          )}
        </main>

        {/* Stats Footer */}
        {hasSearched && movies.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm text-slate-400">Movies Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm text-slate-400">User Ratings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💎</div>
              <div className="text-2xl font-bold text-white">20+</div>
              <div className="text-sm text-slate-400">Genres</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">❤️</div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm text-slate-400">Free to Use</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
