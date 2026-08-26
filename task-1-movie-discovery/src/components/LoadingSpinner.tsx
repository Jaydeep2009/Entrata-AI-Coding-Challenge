interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  console.log('[LoadingSpinner] Displaying loading state');
  
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-purple-500"></div>
        <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
      </div>
      <p className="text-slate-300 mt-6 text-lg">{message}</p>
      <div className="flex gap-2 mt-4">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}
