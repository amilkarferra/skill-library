import { useState, useCallback } from 'react';
import type { ApiRequestState } from '../models/ApiRequestState';

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>
): ApiRequestState<T> {
  const [responseData, setResponseData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const executeRequest = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true);
      setRequestError(null);
      try {
        const apiResponseData = await apiFunction(...args);
        setResponseData(apiResponseData);
        return apiResponseData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setRequestError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  const clearError = useCallback(() => {
    setRequestError(null);
  }, []);

  return { responseData, isLoading, requestError, executeRequest, clearError };
}
