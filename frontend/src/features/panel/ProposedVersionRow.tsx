import { useCallback } from 'react';
import { Check, X, HardDrive, Upload } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { formatFileSize } from '../../shared/formatters/format-file-size';
import { formatRelativeDate } from '../../shared/formatters/format-relative-date';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import './ProposedVersionRow.css';

type ReviewAction = 'approve' | 'reject';

interface ProposedVersionRowProps {
  readonly version: SkillVersion;
  readonly skillSlug: string;
  readonly onReview: (slug: string, version: string, action: ReviewAction) => void;
}

export function ProposedVersionRow({
  version,
  skillSlug,
  onReview,
}: ProposedVersionRowProps) {
  const handleApprove = useCallback(() => {
    onReview(skillSlug, version.version, 'approve');
  }, [onReview, skillSlug, version.version]);

  const handleReject = useCallback(() => {
    onReview(skillSlug, version.version, 'reject');
  }, [onReview, skillSlug, version.version]);

  return (
    <div className="proposed-version-row">
      <div className="proposed-version-icon">
        <Upload size={14} />
      </div>
      <div className="proposed-version-info">
        <span className="proposed-version-label">Version proposal</span>
        <span className="proposed-version-number">
          @{version.uploadedByUsername} proposed <strong>v{version.version}</strong> for <strong>{skillSlug}</strong>
        </span>
        <span className="proposed-version-changelog">{version.changelog}</span>
        <div className="proposed-version-meta">
          <span className="proposed-version-meta-item">
            <HardDrive size={12} />
            {formatFileSize(version.fileSize)}
          </span>
          <span className="proposed-version-meta-item">
            {formatRelativeDate(version.createdAt)}
          </span>
        </div>
      </div>
      <div className="proposed-version-actions">
        <Button variant="success" size="small" onClick={handleApprove}>
          <Check size={13} />
          Approve
        </Button>
        <Button variant="danger-outline" size="small" onClick={handleReject}>
          <X size={13} />
          Reject
        </Button>
      </div>
    </div>
  );
}
