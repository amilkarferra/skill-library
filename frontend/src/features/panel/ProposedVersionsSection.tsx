import { useEffect, useCallback, useState } from 'react';
import { EmptyState } from '../../shared/components/EmptyState';
import { ProposedVersionRow } from './ProposedVersionRow';
import {
  fetchPendingVersionProposals,
  reviewVersionProposal,
} from './panel.service';
import type { VersionWithSlug } from '../../shared/models/VersionWithSlug';
import './ProposedVersionsSection.css';

export function ProposedVersionsSection() {
  const [versions, setVersions] = useState<VersionWithSlug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const pendingVersions = await fetchPendingVersionProposals();
      setVersions(pendingVersions);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load proposed versions';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleReview = useCallback(async (
    slug: string,
    version: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      await reviewVersionProposal(slug, version, action);
    } finally {
      await loadVersions();
    }
  }, [loadVersions]);

  const hasVersions = versions.length > 0;

  if (isLoading) {
    return (
      <div className="proposed-versions-section">
        <p className="proposed-versions-loading">Loading proposed versions...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="proposed-versions-section">
        <p className="proposed-versions-error">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="proposed-versions-section">
      {!hasVersions && (
        <EmptyState
          title="No pending proposals"
          description="There are no version proposals awaiting your review."
        />
      )}
      {hasVersions && (
        <div className="proposed-versions-list">
          {versions.map((version) => (
            <ProposedVersionRow
              key={version.id}
              version={version}
              skillSlug={version.skillSlug}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
