import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { buildFileValidationError } from './publish-validation';
import './PublishDropzone.css';

interface PublishDropzoneProps {
  readonly onFileAccepted: (file: File) => void;
  readonly isFadingOut: boolean;
}

const ACCEPTED_EXTENSIONS = '.skill,.md,.zip';
const DROPZONE_ICON_SIZE = 40;

export function PublishDropzone({ onFileAccepted, isFadingOut }: PublishDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileInput = useCallback(
    (file: File) => {
      const error = buildFileValidationError(file);
      const hasValidationError = error !== null;
      if (hasValidationError) {
        setValidationError(error);
        return;
      }
      setValidationError(null);
      onFileAccepted(file);
    },
    [onFileAccepted],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const firstFile = event.target.files?.[0];
      const hasFiles = firstFile !== undefined;
      if (hasFiles) {
        handleFileInput(firstFile);
      }
    },
    [handleFileInput],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const hasDroppedFiles = event.dataTransfer.files.length > 0;
      if (hasDroppedFiles) {
        handleFileInput(event.dataTransfer.files[0]);
      }
    },
    [handleFileInput],
  );

  const dropzoneClasses = getDropzoneClasses(isDragOver, validationError, isFadingOut);
  const hasValidationError = validationError !== null;

  return (
    <div
      className={dropzoneClasses}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="publish-dropzone-hidden-input"
        onChange={handleFileChange}
      />
      <Upload size={DROPZONE_ICON_SIZE} className="publish-dropzone-icon" />
      <div className="publish-dropzone-text">
        Drop your skill file here or click to browse
      </div>
      {hasValidationError && (
        <div className="publish-dropzone-error">{validationError}</div>
      )}
      {!hasValidationError && (
        <div className="publish-dropzone-hint">
          .skill, .zip or .md - Max 50MB
        </div>
      )}
    </div>
  );
}

function getDropzoneClasses(
  isDragOver: boolean,
  validationError: string | null,
  isFadingOut: boolean,
): string {
  const baseClass = 'publish-dropzone';
  const classes: string[] = [baseClass];

  if (isDragOver) {
    classes.push('publish-dropzone--drag-over');
  }

  const hasValidationError = validationError !== null;
  if (hasValidationError) {
    classes.push('publish-dropzone--error');
  }

  if (isFadingOut) {
    classes.push('publish-dropzone--fading-out');
  }

  return classes.join(' ');
}
