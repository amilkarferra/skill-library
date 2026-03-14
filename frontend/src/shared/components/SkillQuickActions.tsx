import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import { Heart, Download, MessageSquare } from 'lucide-react';
import './SkillQuickActions.css';

type ActionSize = 'small' | 'medium';

interface SkillQuickActionsProps {
  readonly totalLikes: number;
  readonly totalDownloads: number;
  readonly totalComments?: number;
  readonly isLiked?: boolean;
  readonly onLikeToggle?: (() => void) | null;
  readonly isDownloadLoading?: boolean;
  readonly onDownload?: (() => void) | null;
  readonly onCommentNavigate?: (() => void) | null;
  readonly size?: ActionSize;
}

const ICON_SIZE_MAP: Record<ActionSize, number> = {
  small: 11,
  medium: 13,
};

export function SkillQuickActions({
  totalLikes,
  totalDownloads,
  totalComments,
  isLiked,
  isDownloadLoading = false,
  onLikeToggle,
  onDownload,
  onCommentNavigate,
  size = 'medium',
}: SkillQuickActionsProps) {
  const iconSize = ICON_SIZE_MAP[size];
  const hasComments = totalComments !== undefined;

  const handleLikeClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onLikeToggle?.();
    },
    [onLikeToggle]
  );

  const handleDownloadClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onDownload?.();
    },
    [onDownload]
  );

  const handleCommentClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onCommentNavigate?.();
    },
    [onCommentNavigate]
  );

  const isLikeInteractive = onLikeToggle !== undefined && onLikeToggle !== null;
  const isDownloadInteractive = onDownload !== undefined && onDownload !== null;
  const isCommentInteractive =
    onCommentNavigate !== undefined && onCommentNavigate !== null;

  const likeClassName = buildLikeClassName(
    isLikeInteractive,
    isLiked === true,
    size
  );
  const downloadClassName = buildActionClassName(isDownloadInteractive, size);
  const commentClassName = buildActionClassName(isCommentInteractive, size);

  const likeElement = isLikeInteractive ? (
    <button className={likeClassName} onClick={handleLikeClick} type="button">
      <span className="skill-quick-action-icon">
        <Heart size={iconSize} fill={isLiked ? 'currentColor' : 'none'} />
      </span>
      {totalLikes}
    </button>
  ) : (
    <span className={likeClassName}>
      <span className="skill-quick-action-icon">
        <Heart size={iconSize} />
      </span>
      {totalLikes}
    </span>
  );

  const downloadIcon = isDownloadLoading
    ? <span className="skill-quick-action-spinner" />
    : <Download size={iconSize} />;

  const downloadElement = isDownloadInteractive ? (
    <button
      className={downloadClassName}
      onClick={handleDownloadClick}
      disabled={isDownloadLoading}
      type="button"
    >
      <span className="skill-quick-action-icon">
        {downloadIcon}
      </span>
      {totalDownloads}
    </button>
  ) : (
    <span className={downloadClassName}>
      <span className="skill-quick-action-icon">
        <Download size={iconSize} />
      </span>
      {totalDownloads}
    </span>
  );

  return (
    <div className="skill-quick-actions">
      {likeElement}
      {downloadElement}
      {hasComments && (
        isCommentInteractive ? (
          <button
            className={commentClassName}
            onClick={handleCommentClick}
            type="button"
          >
            <span className="skill-quick-action-icon">
              <MessageSquare size={iconSize} />
            </span>
            {totalComments}
          </button>
        ) : (
          <span className={commentClassName}>
            <span className="skill-quick-action-icon">
              <MessageSquare size={iconSize} />
            </span>
            {totalComments}
          </span>
        )
      )}
    </div>
  );
}

function buildLikeClassName(
  isInteractive: boolean,
  isLiked: boolean,
  size: ActionSize
): string {
  const base = 'skill-quick-action';
  const parts = [base];

  if (isInteractive) {
    parts.push(`${base}--interactive`);
  }
  if (isLiked) {
    parts.push(`${base}--liked`);
  }
  if (size === 'small') {
    parts.push(`${base}--small`);
  }

  return parts.join(' ');
}

function buildActionClassName(
  isInteractive: boolean,
  size: ActionSize
): string {
  const base = 'skill-quick-action';
  const parts = [base];

  if (isInteractive) {
    parts.push(`${base}--interactive`);
  }
  if (size === 'small') {
    parts.push(`${base}--small`);
  }

  return parts.join(' ');
}
