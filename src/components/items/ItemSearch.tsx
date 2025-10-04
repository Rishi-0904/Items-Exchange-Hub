import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface ItemSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export default function ItemSearch({ 
  onSearch, 
  placeholder = 'Search items...',
  className = '',
  initialValue = ''
}: ItemSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search to avoid too many re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div 
      className={`relative ${className} ${isFocused ? 'ring-2 ring-primary-500' : ''} rounded-lg transition-all`}
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClear();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      
      {searchTerm && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <FiX className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
