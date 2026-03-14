import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

const DIALOG_TITLE = 'Delete Skill';
const DIALOG_MESSAGE = 'This action cannot be undone.';
const CONFIRM_LABEL = 'Delete';

describe('ConfirmDialog', () => {
  it('should render title', () => {
    render(
      <ConfirmDialog
        title={DIALOG_TITLE}
        message={DIALOG_MESSAGE}
        confirmLabel={CONFIRM_LABEL}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(DIALOG_TITLE)).toBeInTheDocument();
  });

  it('should render message', () => {
    render(
      <ConfirmDialog
        title={DIALOG_TITLE}
        message={DIALOG_MESSAGE}
        confirmLabel={CONFIRM_LABEL}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(DIALOG_MESSAGE)).toBeInTheDocument();
  });

  it('should render confirm button with custom label', () => {
    render(
      <ConfirmDialog
        title={DIALOG_TITLE}
        message={DIALOG_MESSAGE}
        confirmLabel={CONFIRM_LABEL}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: CONFIRM_LABEL })).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(
      <ConfirmDialog
        title={DIALOG_TITLE}
        message={DIALOG_MESSAGE}
        confirmLabel={CONFIRM_LABEL}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        title={DIALOG_TITLE}
        message={DIALOG_MESSAGE}
        confirmLabel={CONFIRM_LABEL}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: CONFIRM_LABEL }));
    expect(handleConfirm).toHaveBeenCalledOnce();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        title={DIALOG_TITLE}
        message={DIALOG_MESSAGE}
        confirmLabel={CONFIRM_LABEL}
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleCancel).toHaveBeenCalledOnce();
  });

  it('should call onCancel when clicking overlay background', async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <ConfirmDialog
        title={DIALOG_TITLE}
        message={DIALOG_MESSAGE}
        confirmLabel={CONFIRM_LABEL}
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const overlay = container.querySelector('.confirm-dialog-overlay')!;
    await user.click(overlay);
    expect(handleCancel).toHaveBeenCalledOnce();
  });

  it('should not call onCancel when clicking dialog content', async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        title={DIALOG_TITLE}
        message={DIALOG_MESSAGE}
        confirmLabel={CONFIRM_LABEL}
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    await user.click(screen.getByText(DIALOG_TITLE));
    expect(handleCancel).not.toHaveBeenCalled();
  });
});
