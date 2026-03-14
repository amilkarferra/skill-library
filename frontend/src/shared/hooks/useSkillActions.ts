import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useAuthStore } from '../stores/useAuthStore';
import { useLikeStore } from '../stores/useLikeStore';
import { useDownloadStore } from '../stores/useDownloadStore';
import {
  toggleSkillLike,
  fetchSkillVersionDownloadUrl,
} from '../services/skill-actions.service';
import type { SkillActionTarget } from '../models/SkillActionTarget';

interface SkillActionsResult {
  readonly handleToggleLike: () => void;
  readonly handleDownload: (() => void) | null;
  readonly handleNavigateToComments: () => void;
  readonly isLikeInProgress: boolean;
  readonly isDownloadInProgress: boolean;
  readonly downloadError: string | null;
}

export function useSkillActions(skill: SkillActionTarget): SkillActionsResult {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { signIn } = useAuth();
  const { publishLikeUpdate } = useLikeStore();
  const { publishDownloadUpdate } = useDownloadStore();
  const [isLikeInProgress, setIsLikeInProgress] = useState(false);
  const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const hasCurrentVersion = skill.currentVersion !== null;

  const handleToggleLike = useCallback(async () => {
    if (!isAuthenticated) {
      await signIn();
      return;
    }

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
    isAuthenticated,
    signIn,
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

      const updatedTotalDownloads = skill.totalDownloads + 1;
      publishDownloadUpdate({
        skillId: skill.id,
        totalDownloads: updatedTotalDownloads,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Download failed';
      setDownloadError(errorMessage);
    } finally {
      setIsDownloadInProgress(false);
    }
  }, [skill.id, skill.name, skill.currentVersion, skill.totalDownloads, publishDownloadUpdate]);

  const handleNavigateToComments = useCallback(() => {
    navigate(`/skills/${skill.name}?tab=comments`);
  }, [navigate, skill.name]);

  const downloadHandler = hasCurrentVersion ? handleDownload : null;

  return {
    handleToggleLike,
    handleDownload: downloadHandler,
    handleNavigateToComments,
    isLikeInProgress,
    isDownloadInProgress,
    downloadError,
  };
}
