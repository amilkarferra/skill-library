import { formatFileSize } from '../../shared/formatters/format-file-size';
import './ExtractingState.css';

interface ExtractingStateProps {
  readonly fileName: string;
  readonly fileSize: number;
}

export function ExtractingState({ fileName, fileSize }: ExtractingStateProps) {
  const formattedSize = formatFileSize(fileSize);

  return (
    <div className="extracting-state">
      <div className="extracting-state-spinner" />
      <div className="extracting-state-text">Extracting metadata from file...</div>
      <div className="extracting-state-file">{fileName} ({formattedSize})</div>
    </div>
  );
}
