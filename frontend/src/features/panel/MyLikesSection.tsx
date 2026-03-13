import { useEffect, useCallback, useState } from 'react';
import { EmptyState } from '../../shared/components/EmptyState';
import { fetchMyLikes } from './panel.service';
import { del } from '../../shared/services/api.client';
import { useLikeStore } from '../../shared/stores/useLikeStore';
import { LikeItem } from './LikeItem';
import { PanelListSkeleton } from './PanelListSkeleton';
import type { SkillSummary } from '../../shared/models/SkillSummary';
import './MyLikesSection.css';

export function MyLikesSection() {
  const { lastLikeUpdate } = useLikeStore();
  const [likedSkills, setLikedSkills] = useState<SkillSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadLikes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const fetchedSkills = await fetchMyLikes();
      setLikedSkills(fetchedSkills);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load likes';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  useEffect(() => {
    const hasNoUpdate = lastLikeUpdate === null;
    if (hasNoUpdate) return;

    const isUnliked = !lastLikeUpdate.isLiked;
    if (isUnliked) {
      setLikedSkills((previous) =>
        previous.filter((likedSkill) => likedSkill.id !== lastLikeUpdate.skillId)
      );
      return;
    }

    loadLikes();
  }, [lastLikeUpdate, loadLikes]);

  const handleUnlike = useCallback(async (skill: SkillSummary) => {
    try {
      await del(`/skills/${skill.name}/like`);
      setLikedSkills((previous) =>
        previous.filter((likedSkill) => likedSkill.id !== skill.id)
      );
    } catch {
      await loadLikes();
    }
  }, [loadLikes]);

  const hasLikedSkills = likedSkills.length > 0;
  const hasLoadError = loadError !== null;
  const isDataReady = !isLoading && !hasLoadError;

  return (
    <div className="my-likes-section">
      <div className="my-likes-header">
        <h2 className="my-likes-title">My Likes</h2>
      </div>
      {isLoading && <PanelListSkeleton />}
      {hasLoadError && (
        <p className="my-likes-error">{loadError}</p>
      )}
      {isDataReady && !hasLikedSkills && (
        <EmptyState
          title="No liked skills"
          description="You have not liked any skills yet. Browse the catalog to find skills you enjoy."
        />
      )}
      {isDataReady && hasLikedSkills && (
        <div className="my-likes-list">
          {likedSkills.map((likedSkill) => (
            <LikeItem
              key={likedSkill.id}
              skill={likedSkill}
              onUnlike={handleUnlike}
            />
          ))}
        </div>
      )}
    </div>
  );
}
