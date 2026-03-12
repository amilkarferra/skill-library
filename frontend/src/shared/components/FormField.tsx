import type { ReactNode } from 'react';
import { FormLabel } from './FormLabel';
import './FormField.css';

interface FormFieldProps {
  readonly label: string;
  readonly htmlFor?: string;
  readonly children: ReactNode;
}

export function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <FormLabel htmlFor={htmlFor}>{label}</FormLabel>
      {children}
    </div>
  );
}
