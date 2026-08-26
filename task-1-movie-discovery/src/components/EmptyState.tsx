interface EmptyStateProps {
  message: string;
  isNoResults?: boolean;
}

export function EmptyState({ message, isNoResults = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">
        {isNoResults ? '😔' : '🔍'}
      </div>
      <p className="text-slate-300 text-xl mb-2">{message}</p>
      {isNoResults && (
        <p className="text-slate-400 text-sm">
          Try searching with different keywords
        </p>
      )}
    </div>
  );
}
