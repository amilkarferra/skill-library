import { useCallback, useRef, useState } from 'react';
import { Upload, File } from 'lucide-react';
import { formatFileSize } from '../../shared/formatters/format-file-size';
import './FileUpload.css';

interface FileUploadProps {
  readonly onFileSelect: (file: File) => void;
  readonly selectedFile: File | null;
}

const ACCEPTED_EXTENSIONS = '.skill,.md';

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const hasFiles = event.target.files && event.target.files.length > 0;
    if (hasFiles) {
      onFileSelect(event.target.files![0]);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const hasDroppedFiles = event.dataTransfer.files.length > 0;
    if (hasDroppedFiles) {
      onFileSelect(event.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const hasSelectedFile = selectedFile !== null;
  const dropzoneClass = isDragOver
    ? 'file-upload-dropzone file-upload-dropzone--drag-over'
    : 'file-upload-dropzone';

  return (
    <div className="file-upload">
      <span className="file-upload-label label-uppercase">FILE</span>
      <div
        className={dropzoneClass}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="file-upload-input"
          onChange={handleFileChange}
        />
        {!hasSelectedFile && (
          <div className="file-upload-placeholder">
            <Upload size={20} className="file-upload-placeholder-icon" />
            <span className="file-upload-placeholder-text">
              Drag and drop or click to browse
            </span>
            <span className="file-upload-placeholder-hint">
              Accepts .skill and .md files. Max 50MB.
            </span>
          </div>
        )}
        {hasSelectedFile && (
          <div className="file-upload-selected">
            <File size={16} className="file-upload-selected-icon" />
            <span className="file-upload-selected-name">{selectedFile.name}</span>
            <span className="file-upload-selected-size">
              {formatFileSize(selectedFile.size)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
