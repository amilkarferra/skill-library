import { useState, useCallback } from 'react';
import { Download, User, HardDrive, Calendar } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';
import { VersionStatusBadge } from '../../shared/components/VersionStatusBadge';
import { formatFileSize } from '../../shared/formatters/format-file-size';
import { formatDate } from '../../shared/formatters/format-date';
import { fetchSkillVersionDownloadUrl } from '../../shared/services/skill-actions.service';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import './VersionsTab.css';

interface VersionsTabProps {
  readonly versions: SkillVersion[];
  readonly slug: string;
  readonly onVersionDownloaded: () => void;
}

interface VersionItemProps {
  readonly version: SkillVersion;
  readonly slug: string;
  readonly isAlternate: boolean;
  readonly onDownloaded: () => void;
}

function VersionItem({
  version,
  slug,
  isAlternate,
  onDownloaded,
}: VersionItemProps) {
  const isPublished = version.status === 'published';
  const isNotPublished = !isPublished;
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;

    setDownloadError(null);
    setIsDownloading(true);
    try {
      const downloadResponse = await fetchSkillVersionDownloadUrl(slug, version.version);
      window.open(downloadResponse.downloadUrl, '_blank');
      onDownloaded();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      setDownloadError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  }, [slug, version.version, isDownloading, onDownloaded]);

  const itemClassName = isAlternate
    ? 'version-item version-item--alt'
    : 'version-item';

  return (
    <div className={itemClassName}>
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
            disabled={isDownloading}
          >
            <Download size={14} />
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        )}
        {downloadError !== null && (
          <span className="version-download-error">{downloadError}</span>
        )}
      </div>
    </div>
  );
}

export function VersionsTab({
  versions,
  slug,
  onVersionDownloaded,
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
        {versions.map((version, index) => {
          const isAlternate = index % 2 !== 0;
          return (
            <VersionItem
              key={version.id}
              version={version}
              slug={slug}
              isAlternate={isAlternate}
              onDownloaded={onVersionDownloaded}
            />
          );
        })}
      </div>
    </div>
  );
}
