import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { buildFileValidationError } from '../../features/publish/publish-validation';
import './QuickPublishDropzone.css';

const QUICK_PUBLISH_ICON_SIZE = 20;

export function QuickPublishDropzone() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const navigateToPublishWithFile = useCallback(
    (file: File) => {
      const error = buildFileValidationError(file);
      const hasValidationError = error !== null;
      if (hasValidationError) {
        setValidationError(error);
        return;
      }
      setValidationError(null);
      navigate('/publish', { state: { quickPublishFile: file } });
    },
    [navigate],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const firstFile = event.target.files?.[0];
      const hasFile = firstFile !== undefined;
      if (hasFile) {
        navigateToPublishWithFile(firstFile);
      }
    },
    [navigateToPublishWithFile],
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
        navigateToPublishWithFile(event.dataTransfer.files[0]);
      }
    },
    [navigateToPublishWithFile],
  );

  const containerClassName = buildContainerClassName(isDragOver);
  const hasValidationError = validationError !== null;

  return (
    <div
      className={containerClassName}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".skill,.md,.zip"
        className="quick-publish-hidden-input"
        onChange={handleFileChange}
      />
      <Upload size={QUICK_PUBLISH_ICON_SIZE} className="quick-publish-icon" />
      <span className="quick-publish-label">Quick Publish</span>
      <span className="quick-publish-hint">Drop file or click</span>
      {hasValidationError && (
        <span className="quick-publish-error">{validationError}</span>
      )}
    </div>
  );
}

function buildContainerClassName(isDragOver: boolean): string {
  const baseClass = 'quick-publish-dropzone';
  return isDragOver
    ? `${baseClass} quick-publish-dropzone--drag-over`
    : baseClass;
}
