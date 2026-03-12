import { useCallback } from 'react';
import { Check, X, User, HardDrive, Upload } from 'lucide-react';
import { formatFileSize } from '../../shared/formatters/format-file-size';
import { formatDate } from '../../shared/formatters/format-date';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import './ProposedVersionRow.css';

interface ProposedVersionRowProps {
  version: SkillVersion;
  skillSlug: string;
  onReview: (slug: string, version: string, action: 'approve' | 'reject') => void;
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
          @{version.uploadedByUsername} proposed v{version.version} for {skillSlug}
        </span>
        <span className="proposed-version-changelog">{version.changelog}</span>
        <div className="proposed-version-meta">
          <span className="proposed-version-meta-item">
            <User size={12} />
            {version.uploadedByUsername}
          </span>
          <span className="proposed-version-meta-item">
            <HardDrive size={12} />
            {formatFileSize(version.fileSize)}
          </span>
          <span className="proposed-version-meta-item">
            {formatDate(version.createdAt)}
          </span>
        </div>
      </div>
      <div className="proposed-version-actions">
        <button
          className="proposed-version-btn proposed-version-btn--approve"
          onClick={handleApprove}
        >
          <Check size={13} />
          Approve
        </button>
        <button
          className="proposed-version-btn proposed-version-btn--reject"
          onClick={handleReject}
        >
          <X size={13} />
          Reject
        </button>
      </div>
    </div>
  );
}
