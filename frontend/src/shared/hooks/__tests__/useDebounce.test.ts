import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

const SHORT_DELAY_MS = 100;
const DEFAULT_DELAY_MS = 300;

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const initialValue = 'hello';
    const { result } = renderHook(() => useDebounce(initialValue, SHORT_DELAY_MS));
    expect(result.current).toBe(initialValue);
  });

  it('should not update value before delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, SHORT_DELAY_MS),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    const halfDelay = SHORT_DELAY_MS / 2;
    act(() => {
      vi.advanceTimersByTime(halfDelay);
    });

    expect(result.current).toBe('initial');
  });

  it('should update value after delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, SHORT_DELAY_MS),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(SHORT_DELAY_MS);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, SHORT_DELAY_MS),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });

    const almostFullDelay = SHORT_DELAY_MS - 10;
    act(() => {
      vi.advanceTimersByTime(almostFullDelay);
    });

    rerender({ value: 'third' });

    act(() => {
      vi.advanceTimersByTime(almostFullDelay);
    });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(SHORT_DELAY_MS);
    });

    expect(result.current).toBe('third');
  });

  it('should use default delay when not specified', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    const justBeforeDefault = DEFAULT_DELAY_MS - 1;
    act(() => {
      vi.advanceTimersByTime(justBeforeDefault);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });
});
