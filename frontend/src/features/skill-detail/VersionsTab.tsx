import { useCallback } from 'react';
import { Download, User, HardDrive, Calendar } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';
import { VersionStatusBadge } from '../../shared/components/VersionStatusBadge';
import { formatFileSize } from '../../shared/formatters/format-file-size';
import { formatDate } from '../../shared/formatters/format-date';
import { fetchSkillVersionDownloadUrl } from './skill-detail.service';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import './VersionsTab.css';

interface VersionsTabProps {
  readonly versions: SkillVersion[];
  readonly slug: string;
}

function VersionItem({
  version,
  slug,
}: {
  readonly version: SkillVersion;
  readonly slug: string;
}) {
  const isPublished = version.status === 'published';
  const isNotPublished = !isPublished;

  const handleDownload = useCallback(async () => {
    const downloadInfo = await fetchSkillVersionDownloadUrl(slug, version.version);
    window.open(downloadInfo.downloadUrl, '_blank');
  }, [slug, version.version]);

  return (
    <div className="version-item">
      <div className="version-info">
        <div className="version-header">
          <span className="version-number">v{version.version}</span>
          {isNotPublished && (
            <VersionStatusBadge status={version.status} />
          )}
        </div>
        <span className="version-changelog">{version.changelog}</span>
        <div className="version-meta">
          <div className="version-meta-item">
            <User size={12} />
            <span className="version-meta-value">{version.uploadedByUsername}</span>
          </div>
          <div className="version-meta-item">
            <HardDrive size={12} />
            <span className="version-meta-value">
              {formatFileSize(version.fileSize)}
            </span>
          </div>
          <div className="version-meta-item">
            <Calendar size={12} />
            <span className="version-meta-value">
              {formatDate(version.createdAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="version-actions">
        {isPublished && (
          <button
            className="version-download-button"
            onClick={handleDownload}
          >
            <Download size={14} />
            Download
          </button>
        )}
      </div>
    </div>
  );
}

export function VersionsTab({
  versions,
  slug,
}: VersionsTabProps) {
  const hasVersions = versions.length > 0;

  if (!hasVersions) {
    return (
      <div className="versions-tab">
        <EmptyState
          title="No versions yet"
          description="No versions have been published for this skill."
        />
      </div>
    );
  }

  return (
    <div className="versions-tab">
      <div className="versions-list">
        {versions.map((version) => (
          <VersionItem
            key={version.id}
            version={version}
            slug={slug}
          />
        ))}
      </div>
    </div>
  );
}
