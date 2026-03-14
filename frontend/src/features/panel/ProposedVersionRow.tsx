import { useCallback } from 'react';
import { Check, X, HardDrive, Upload } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { formatFileSize } from '../../shared/formatters/format-file-size';
import { formatRelativeDate } from '../../shared/formatters/format-relative-date';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import styles from './ProposedVersionRow.module.css';

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
    <div className={styles.row}>
      <div className={styles.icon}>
        <Upload size={14} />
      </div>
      <div className={styles.info}>
        <span className={styles.label}>Version proposal</span>
        <span className={styles.number}>
          @{version.uploadedByUsername} proposed <strong>v{version.version}</strong> for <strong>{skillSlug}</strong>
        </span>
        <span className={styles.changelog}>{version.changelog}</span>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <HardDrive size={12} />
            {formatFileSize(version.fileSize)}
          </span>
          <span className={styles.metaItem}>
            {formatRelativeDate(version.createdAt)}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
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
