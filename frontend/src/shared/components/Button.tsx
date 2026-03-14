import type { ReactNode, MouseEvent } from 'react';
import './Button.css';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'ghost'
  | 'danger-outline'
  | 'download'
  | 'like'
  | 'like-active';

type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isFullWidth?: boolean;
  readonly isLoading?: boolean;
  readonly disabled?: boolean;
  readonly type?: 'button' | 'submit';
  readonly onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly ariaLabel?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  isFullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  ariaLabel,
}: ButtonProps) {
  const className = buildButtonClassName(variant, size, isFullWidth);
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={className}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {isLoading && <span className="button-spinner" />}
      {children}
    </button>
  );
}

function buildButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  isFullWidth: boolean
): string {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
  ];

  if (isFullWidth) {
    classes.push('button--full-width');
  }

  return classes.join(' ');
}
