import { useState, useEffect } from 'react';

const DEFAULT_DEBOUNCE_DELAY_MS = 300;

export function useDebounce<T>(value: T, delayMs: number = DEFAULT_DEBOUNCE_DELAY_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
