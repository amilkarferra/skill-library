import { renderHook, act } from '@testing-library/react';
import { useConfirmDialog } from '../useConfirmDialog';

const SAMPLE_DIALOG_TITLE = 'Delete Skill';
const SAMPLE_DIALOG_MESSAGE = 'Are you sure you want to delete this skill?';
const SAMPLE_CONFIRM_LABEL = 'Delete';

describe('useConfirmDialog', () => {
  it('should initialize with dialog closed', () => {
    const { result } = renderHook(() => useConfirmDialog());
    expect(result.current.dialogState.isOpen).toBe(false);
  });

  it('should open dialog with provided config', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const onConfirm = vi.fn();

    act(() => {
      result.current.openDialog({
        title: SAMPLE_DIALOG_TITLE,
        message: SAMPLE_DIALOG_MESSAGE,
        confirmLabel: SAMPLE_CONFIRM_LABEL,
        isDangerous: true,
        onConfirm,
      });
    });

    expect(result.current.dialogState.isOpen).toBe(true);
    expect(result.current.dialogState.title).toBe(SAMPLE_DIALOG_TITLE);
    expect(result.current.dialogState.message).toBe(SAMPLE_DIALOG_MESSAGE);
    expect(result.current.dialogState.confirmLabel).toBe(SAMPLE_CONFIRM_LABEL);
    expect(result.current.dialogState.isDangerous).toBe(true);
  });

  it('should close dialog and reset state', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const onConfirm = vi.fn();

    act(() => {
      result.current.openDialog({
        title: SAMPLE_DIALOG_TITLE,
        message: SAMPLE_DIALOG_MESSAGE,
        confirmLabel: SAMPLE_CONFIRM_LABEL,
        isDangerous: false,
        onConfirm,
      });
    });

    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.dialogState.isOpen).toBe(false);
    expect(result.current.dialogState.title).toBe('');
    expect(result.current.dialogState.message).toBe('');
  });

  it('should preserve onConfirm callback when opened', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const onConfirm = vi.fn();

    act(() => {
      result.current.openDialog({
        title: SAMPLE_DIALOG_TITLE,
        message: SAMPLE_DIALOG_MESSAGE,
        confirmLabel: SAMPLE_CONFIRM_LABEL,
        isDangerous: false,
        onConfirm,
      });
    });

    result.current.dialogState.onConfirm();
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
