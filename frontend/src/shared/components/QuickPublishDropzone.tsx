import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { buildFileValidationError } from '../../features/publish/publish-validation';
import { AuthGuardDialog } from './AuthGuardDialog';
import './QuickPublishDropzone.css';

const QUICK_PUBLISH_ICON_SIZE = 20;
const PUBLISH_LOGIN_MESSAGE = 'You need to sign in to publish skills. Would you like to sign in now?';

export function QuickPublishDropzone() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const {
    guardWithLogin,
    loginDialogState,
    closeLoginDialog,
  } = useAuthGuard();

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

  const pendingFileRef = useRef<File | null>(null);

  const handleAuthenticatedPublish = useCallback(() => {
    const pendingFile = pendingFileRef.current;
    if (pendingFile !== null) {
      navigateToPublishWithFile(pendingFile);
      pendingFileRef.current = null;
      return;
    }
    navigate('/publish');
  }, [navigateToPublishWithFile, navigate]);

  const guardedPublishWithFile = useCallback(
    (file: File) => {
      pendingFileRef.current = file;
      const guardedAction = guardWithLogin({
        message: PUBLISH_LOGIN_MESSAGE,
        onAuthenticated: handleAuthenticatedPublish,
      });
      guardedAction();
    },
    [guardWithLogin, handleAuthenticatedPublish],
  );

  const handleClick = useCallback(() => {
    const guardedAction = guardWithLogin({
      message: PUBLISH_LOGIN_MESSAGE,
      onAuthenticated: () => inputRef.current?.click(),
    });
    guardedAction();
  }, [guardWithLogin]);

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
        guardedPublishWithFile(event.dataTransfer.files[0]);
      }
    },
    [guardedPublishWithFile],
  );

  const containerClassName = buildContainerClassName(isDragOver);
  const hasValidationError = validationError !== null;

  return (
    <>
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

      <AuthGuardDialog dialogState={loginDialogState} onClose={closeLoginDialog} />
    </>
  );
}

function buildContainerClassName(isDragOver: boolean): string {
  const baseClass = 'quick-publish-dropzone';
  return isDragOver
    ? `${baseClass} quick-publish-dropzone--drag-over`
    : baseClass;
}
