import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <div className="search-bar">
      <Search size={16} className="search-bar-icon" />
      <input
        type="text"
        className="search-bar-input"
        placeholder="Search skills by name, description or author..."
        value={value}
        onChange={handleInputChange}
      />
    </div>
  );
}
