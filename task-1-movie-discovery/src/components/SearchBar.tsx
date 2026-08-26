import { useState, useEffect, useRef, type FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}

export function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Debounced auto-search
  useEffect(() => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      debounceTimeoutRef.current = null;
      console.log('[SearchBar] Debounced search triggered');
      onSearch(trimmedValue);
    }, 300);
    
    debounceTimeoutRef.current = timeoutId;

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [inputValue, onSearch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      setValidationError('Please enter a movie title');
      return;
    }
    
    setValidationError(null);
    
    // Cancel pending debounce to prevent duplicate request
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      console.log('[SearchBar] Cancelled debounce - button clicked');
    }
    
    console.log('[SearchBar] Manual search triggered');
    onSearch(trimmedValue);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search for movies by title..."
              disabled={disabled}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-800/30 disabled:cursor-not-allowed transition-all"
              aria-label="Movie search input"
            />
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30"
          >
            🔍 Search
          </button>
        </div>
        {validationError && (
          <p className="text-red-400 text-sm pl-4" role="alert">
            ⚠️ {validationError}
          </p>
        )}
      </form>
    </div>
  );
}
