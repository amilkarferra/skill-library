import type { ChangeEvent } from 'react';
import './TextArea.css';

interface CharacterCounter {
  readonly count: number;
  readonly limit: number;
}

interface TextAreaProps {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly required?: boolean;
  readonly isTall?: boolean;
  readonly maxLength?: number;
  readonly characterCounter?: CharacterCounter;
}

export type { CharacterCounter };

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  isTall = false,
  maxLength,
  characterCounter,
}: TextAreaProps) {
  const className = isTall ? 'text-area text-area--tall' : 'text-area';
  const hasCounter = characterCounter !== undefined;

  return (
    <>
      <textarea
        id={id}
        className={className}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        maxLength={maxLength}
      />
      {hasCounter && (
        <span className="text-area-counter">
          {characterCounter.count}/{characterCounter.limit}
        </span>
      )}
    </>
  );
}
