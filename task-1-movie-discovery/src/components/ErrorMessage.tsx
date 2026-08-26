import { MovieAPIError } from '../types/movie';

interface ErrorMessageProps {
  error: MovieAPIError;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 max-w-md backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <span className="text-3xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold mb-2 text-lg">Error</h3>
            <p className="text-red-300 text-sm">{error.message}</p>
            
            {error.isTimeout && (
              <p className="text-red-400/70 text-xs mt-2">
                The request took too long. Please check your connection and try again.
              </p>
            )}
            
            {error.isNetworkError && (
              <p className="text-red-400/70 text-xs mt-2">
                Unable to reach the server. Please check your internet connection.
              </p>
            )}
            
            {error.isRateLimit && (
              <p className="text-red-400/70 text-xs mt-2">
                You've made too many requests. Please wait a moment before trying again.
              </p>
            )}
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
