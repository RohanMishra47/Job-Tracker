import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search by company or position',
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border transition-all ${
          isFocused
            ? 'border-purple-500 ring-1 ring-purple-200 bg-white'
            : 'border-gray-200 bg-gray-50 hover:bg-white'
        } text-gray-900 placeholder-gray-500 focus:outline-none`}
        aria-label="Search jobs by company or position"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
