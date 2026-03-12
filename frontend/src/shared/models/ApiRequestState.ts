export interface ApiRequestState<T> {
  responseData: T | null;
  isLoading: boolean;
  requestError: string | null;
  executeRequest: (...args: unknown[]) => Promise<T | null>;
  clearError: () => void;
}
