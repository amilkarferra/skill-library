import { useCallback, useRef } from 'react';
import { File as FileIcon } from 'lucide-react';
import { formatFileSize } from '../../shared/formatters/format-file-size';
import './FileBar.css';

const FILE_ICON_SIZE = 16;

interface FileBarProps {
  readonly fileName: string;
  readonly fileSize: number;
  readonly onChangeFile: (file: File) => void;
}

export function FileBar({ fileName, fileSize, onChangeFile }: FileBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formattedSize = formatFileSize(fileSize);

  const handleChangeClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const firstFile = event.target.files?.[0];
    const hasFiles = firstFile !== undefined;
    if (hasFiles) {
      onChangeFile(firstFile);
    }
  }, [onChangeFile]);

  return (
    <div className="file-bar">
      <div className="file-bar-info">
        <FileIcon size={FILE_ICON_SIZE} className="file-bar-icon" />
        <div>
          <div className="file-bar-name">{fileName}</div>
          <div className="file-bar-size">{formattedSize}</div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".skill,.md,.zip"
        className="file-bar-hidden-input"
        onChange={handleFileChange}
      />
      <button type="button" className="file-bar-change" onClick={handleChangeClick}>
        Change file
      </button>
    </div>
  );
}
