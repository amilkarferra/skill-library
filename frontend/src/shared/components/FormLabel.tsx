import type { ReactNode } from 'react';
import './FormLabel.css';

interface FormLabelProps {
  readonly children: ReactNode;
  readonly htmlFor?: string;
}

export function FormLabel({ children, htmlFor }: FormLabelProps) {
  return (
    <label className="form-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}
