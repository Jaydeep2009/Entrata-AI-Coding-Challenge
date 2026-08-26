import { useMovieSearch } from './hooks/useMovieSearch';
import { SearchBar } from './components/SearchBar';
import { MovieGrid } from './components/MovieGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { EmptyState } from './components/EmptyState';

function App() {
  const { movies, loading, error, hasSearched, searchMovies, clearError } =
    useMovieSearch();

  const handleRetry = () => {
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Movie Discovery
          </h1>
          <p className="text-gray-600 text-center">
            Search for your favorite movies
          </p>
        </header>

        <div className="mb-8">
          <SearchBar onSearch={searchMovies} disabled={loading} />
        </div>

        <main>
          {loading && <LoadingSpinner message="Searching for movies..." />}

          {!loading && error && (
            <ErrorMessage error={error} onRetry={handleRetry} />
          )}

          {!loading && !error && !hasSearched && (
            <EmptyState message="Start by searching for a movie title above" />
          )}

          {!loading && !error && hasSearched && movies.length === 0 && (
            <EmptyState
              message="No movies found"
              isNoResults={true}
            />
          )}

          {!loading && !error && movies.length > 0 && (
            <MovieGrid movies={movies} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
