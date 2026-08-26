interface EmptyStateProps {
  message: string;
  isNoResults?: boolean;
}

export function EmptyState({ message, isNoResults = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="w-24 h-24 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isNoResults ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        )}
      </svg>
      <p className="text-gray-600 text-lg">{message}</p>
      {isNoResults && (
        <p className="text-gray-500 text-sm mt-2">
          Try searching with different keywords
        </p>
      )}
    </div>
  );
}
