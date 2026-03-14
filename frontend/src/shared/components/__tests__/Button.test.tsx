import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

const BUTTON_LABEL = 'Click me';

describe('Button', () => {
  it('should render children text', () => {
    render(<Button>{BUTTON_LABEL}</Button>);
    expect(screen.getByRole('button', { name: BUTTON_LABEL })).toBeInTheDocument();
  });

  it('should apply primary variant class by default', () => {
    render(<Button>{BUTTON_LABEL}</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('button--primary');
  });

  it('should apply specified variant class', () => {
    render(<Button variant="danger">{BUTTON_LABEL}</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('button--danger');
  });

  it('should apply medium size class by default', () => {
    render(<Button>{BUTTON_LABEL}</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('button--medium');
  });

  it('should apply specified size class', () => {
    render(<Button size="small">{BUTTON_LABEL}</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('button--small');
  });

  it('should apply full-width class when isFullWidth is true', () => {
    render(<Button isFullWidth>{BUTTON_LABEL}</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('button--full-width');
  });

  it('should not apply full-width class by default', () => {
    render(<Button>{BUTTON_LABEL}</Button>);
    const button = screen.getByRole('button');
    expect(button.className).not.toContain('button--full-width');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>{BUTTON_LABEL}</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>{BUTTON_LABEL}</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should have type button by default', () => {
    render(<Button>{BUTTON_LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('should accept submit type', () => {
    render(<Button type="submit">{BUTTON_LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('should apply aria-label when provided', () => {
    const ariaLabel = 'Close dialog';
    render(<Button ariaLabel={ariaLabel}>{BUTTON_LABEL}</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', ariaLabel);
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>{BUTTON_LABEL}</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply all variant classes correctly', () => {
    const variants = [
      'primary', 'secondary', 'danger', 'success',
      'ghost', 'danger-outline', 'download', 'like', 'like-active',
    ] as const;

    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>{BUTTON_LABEL}</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(`button--${variant}`);
      unmount();
    });
  });
});
