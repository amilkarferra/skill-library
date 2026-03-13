import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useLikeStore } from '../stores/useLikeStore';
import {
  toggleSkillLike,
  fetchSkillVersionDownloadUrl,
} from '../services/skill-actions.service';
import type { SkillActionTarget } from '../models/SkillActionTarget';

interface SkillActionsResult {
  readonly handleToggleLike: (() => void) | null;
  readonly handleDownload: (() => void) | null;
  readonly handleNavigateToComments: () => void;
  readonly isLikeInProgress: boolean;
  readonly isDownloadInProgress: boolean;
  readonly downloadError: string | null;
}

export function useSkillActions(skill: SkillActionTarget): SkillActionsResult {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { publishLikeUpdate } = useLikeStore();
  const [isLikeInProgress, setIsLikeInProgress] = useState(false);
  const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const hasCurrentVersion = skill.currentVersion !== null;

  const handleToggleLike = useCallback(async () => {
    const isCurrentlyLiked = skill.isLikedByMe === true;
    setIsLikeInProgress(true);

    try {
      await toggleSkillLike(skill.name, isCurrentlyLiked);
      const likesDelta = isCurrentlyLiked ? -1 : 1;
      const updatedTotalLikes = skill.totalLikes + likesDelta;
      const updatedIsLiked = !isCurrentlyLiked;

      publishLikeUpdate({
        skillId: skill.id,
        isLiked: updatedIsLiked,
        totalLikes: updatedTotalLikes,
      });
    } finally {
      setIsLikeInProgress(false);
    }
  }, [
    skill.id,
    skill.name,
    skill.isLikedByMe,
    skill.totalLikes,
    publishLikeUpdate,
  ]);

  const handleDownload = useCallback(async () => {
    const currentVersion = skill.currentVersion;
    const hasNoVersion = currentVersion === null;
    if (hasNoVersion) return;

    setDownloadError(null);
    setIsDownloadInProgress(true);

    try {
      const downloadInfo = await fetchSkillVersionDownloadUrl(
        skill.name,
        currentVersion
      );
      window.open(downloadInfo.downloadUrl, '_blank');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Download failed';
      setDownloadError(errorMessage);
    } finally {
      setIsDownloadInProgress(false);
    }
  }, [skill.name, skill.currentVersion]);

  const handleNavigateToComments = useCallback(() => {
    navigate(`/skills/${skill.name}?tab=comments`);
  }, [navigate, skill.name]);

  const likeHandler = isAuthenticated ? handleToggleLike : null;
  const downloadHandler = hasCurrentVersion ? handleDownload : null;

  return {
    handleToggleLike: likeHandler,
    handleDownload: downloadHandler,
    handleNavigateToComments,
    isLikeInProgress,
    isDownloadInProgress,
    downloadError,
  };
}
