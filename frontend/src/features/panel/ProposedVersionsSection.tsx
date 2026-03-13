import { useEffect, useCallback, useState } from 'react';
import { EmptyState } from '../../shared/components/EmptyState';
import { PanelListSkeleton } from './PanelListSkeleton';
import { ProposedVersionRow } from './ProposedVersionRow';
import {
  fetchNotificationCount,
  fetchPendingVersionProposals,
  reviewVersionProposal,
} from './panel.service';
import { useNotificationsStore } from '../../shared/stores/useNotificationsStore';
import type { VersionWithSlug } from '../../shared/models/VersionWithSlug';
import './ProposedVersionsSection.css';

export function ProposedVersionsSection() {
  const { setNotificationCounts } = useNotificationsStore();
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

  const refreshNotificationCounts = useCallback(async () => {
    const updatedCounts = await fetchNotificationCount();
    setNotificationCounts(updatedCounts);
  }, [setNotificationCounts]);

  const handleReview = useCallback(async (
    slug: string,
    version: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      await reviewVersionProposal(slug, version, action);
    } finally {
      await loadVersions();
      await refreshNotificationCounts();
    }
  }, [loadVersions, refreshNotificationCounts]);

  const hasVersions = versions.length > 0;
  const hasLoadError = loadError !== null;
  const isDataReady = !isLoading && !hasLoadError;

  return (
    <div className="proposed-versions-section">
      {isLoading && <PanelListSkeleton rowCount={2} />}
      {hasLoadError && (
        <p className="proposed-versions-error">{loadError}</p>
      )}
      {isDataReady && !hasVersions && (
        <EmptyState
          title="No pending proposals"
          description="There are no version proposals awaiting your review."
        />
      )}
      {isDataReady && hasVersions && (
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
