import { useState, useEffect, type FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}

export function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debounced auto-search
  useEffect(() => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onSearch(trimmedValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onSearch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      setValidationError('Please enter a movie title');
      return;
    }
    
    setValidationError(null);
    onSearch(trimmedValue);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search for movies..."
            disabled={disabled}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label="Movie search input"
          />
          <button
            type="submit"
            disabled={disabled}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Search
          </button>
        </div>
        {validationError && (
          <p className="text-red-600 text-sm" role="alert">
            {validationError}
          </p>
        )}
      </form>
    </div>
  );
}
