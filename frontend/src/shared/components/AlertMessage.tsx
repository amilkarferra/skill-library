import type { ReactNode } from 'react';
import './AlertMessage.css';

type AlertVariant = 'error' | 'success' | 'warning';

interface AlertMessageProps {
  readonly variant: AlertVariant;
  readonly children: ReactNode;
}

export function AlertMessage({ variant, children }: AlertMessageProps) {
  const className = `alert-message alert-message--${variant}`;

  return (
    <div className={className} role="alert">
      {children}
    </div>
  );
}
