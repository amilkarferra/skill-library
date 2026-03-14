import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

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
    <div className={styles.bar}>
      <Search size={16} className={styles.icon} />
      <input
        type="text"
        className={styles.input}
        placeholder="Search skills by name, description or author..."
        value={value}
        onChange={handleInputChange}
      />
    </div>
  );
}
