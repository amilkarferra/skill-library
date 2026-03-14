import { renderHook, act } from '@testing-library/react';
import { useApi } from '../useApi';

const MOCK_RESPONSE_DATA = { id: 1, name: 'test' };
const MOCK_ERROR_MESSAGE = 'Network error';

function buildSuccessfulApiFunction<T>(responseData: T) {
  return vi.fn().mockResolvedValue(responseData);
}

function buildFailingApiFunction(errorMessage: string) {
  return vi.fn().mockRejectedValue(new Error(errorMessage));
}

function buildFailingWithNonErrorApiFunction() {
  return vi.fn().mockRejectedValue('string error');
}

describe('useApi', () => {
  it('should initialize with null data and no loading', () => {
    const apiFunction = buildSuccessfulApiFunction(MOCK_RESPONSE_DATA);
    const { result } = renderHook(() => useApi(apiFunction));

    expect(result.current.responseData).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.requestError).toBeNull();
  });

  it('should set loading during request execution', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingApiFunction = vi.fn(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    const { result } = renderHook(() => useApi(pendingApiFunction));

    let executePromise: Promise<unknown>;
    act(() => {
      executePromise = result.current.executeRequest();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!(MOCK_RESPONSE_DATA);
      await executePromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set response data on success', async () => {
    const apiFunction = buildSuccessfulApiFunction(MOCK_RESPONSE_DATA);
    const { result } = renderHook(() => useApi(apiFunction));

    await act(async () => {
      await result.current.executeRequest();
    });

    expect(result.current.responseData).toEqual(MOCK_RESPONSE_DATA);
    expect(result.current.requestError).toBeNull();
  });

  it('should set error message on failure', async () => {
    const apiFunction = buildFailingApiFunction(MOCK_ERROR_MESSAGE);
    const { result } = renderHook(() => useApi(apiFunction));

    await act(async () => {
      await result.current.executeRequest();
    });

    expect(result.current.requestError).toBe(MOCK_ERROR_MESSAGE);
    expect(result.current.responseData).toBeNull();
  });

  it('should set generic error for non-Error rejections', async () => {
    const apiFunction = buildFailingWithNonErrorApiFunction();
    const { result } = renderHook(() => useApi(apiFunction));

    await act(async () => {
      await result.current.executeRequest();
    });

    expect(result.current.requestError).toBe('An unexpected error occurred');
  });

  it('should return response data from executeRequest', async () => {
    const apiFunction = buildSuccessfulApiFunction(MOCK_RESPONSE_DATA);
    const { result } = renderHook(() => useApi(apiFunction));

    let returnedData: unknown;
    await act(async () => {
      returnedData = await result.current.executeRequest();
    });

    expect(returnedData).toEqual(MOCK_RESPONSE_DATA);
  });

  it('should return null from executeRequest on failure', async () => {
    const apiFunction = buildFailingApiFunction(MOCK_ERROR_MESSAGE);
    const { result } = renderHook(() => useApi(apiFunction));

    let returnedData: unknown;
    await act(async () => {
      returnedData = await result.current.executeRequest();
    });

    expect(returnedData).toBeNull();
  });

  it('should clear error when clearError is called', async () => {
    const apiFunction = buildFailingApiFunction(MOCK_ERROR_MESSAGE);
    const { result } = renderHook(() => useApi(apiFunction));

    await act(async () => {
      await result.current.executeRequest();
    });

    expect(result.current.requestError).toBe(MOCK_ERROR_MESSAGE);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.requestError).toBeNull();
  });

  it('should clear previous error on new request', async () => {
    const apiFunction = buildFailingApiFunction(MOCK_ERROR_MESSAGE);
    const { result } = renderHook(() => useApi(apiFunction));

    await act(async () => {
      await result.current.executeRequest();
    });

    const successFunction = buildSuccessfulApiFunction(MOCK_RESPONSE_DATA);
    const { result: successResult } = renderHook(() => useApi(successFunction));

    await act(async () => {
      await successResult.current.executeRequest();
    });

    expect(successResult.current.requestError).toBeNull();
  });
});
