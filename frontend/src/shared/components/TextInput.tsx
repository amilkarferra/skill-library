import type { ChangeEvent } from 'react';
import './TextInput.css';

interface TextInputProps {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly placeholder?: string;
  readonly type?: 'text' | 'email' | 'password' | 'url';
  readonly required?: boolean;
  readonly isNarrow?: boolean;
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  isNarrow = false,
}: TextInputProps) {
  const className = isNarrow ? 'text-input text-input--narrow' : 'text-input';

  return (
    <input
      id={id}
      type={type}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  );
}
