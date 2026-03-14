import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useAuthStore } from '../stores/useAuthStore';
import { useLikeStore } from '../stores/useLikeStore';
import { useDownloadStore } from '../stores/useDownloadStore';
import { useConfirmDialog } from './useConfirmDialog';
import {
  toggleSkillLike,
  fetchSkillVersionDownloadUrl,
} from '../services/skill-actions.service';
import type { SkillActionTarget } from '../models/SkillActionTarget';

interface LoginDialogState {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly isDangerous: boolean;
  readonly onConfirm: () => void;
}

interface SkillActionsResult {
  readonly handleToggleLike: () => void;
  readonly handleDownload: (() => void) | null;
  readonly handleNavigateToComments: () => void;
  readonly isLikeInProgress: boolean;
  readonly isDownloadInProgress: boolean;
  readonly downloadError: string | null;
  readonly loginDialogState: LoginDialogState;
  readonly closeLoginDialog: () => void;
}

export function useSkillActions(skill: SkillActionTarget): SkillActionsResult {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { signIn } = useAuth();
  const publishLikeUpdate = useLikeStore((s) => s.publishLikeUpdate);
  const publishDownloadUpdate = useDownloadStore((s) => s.publishDownloadUpdate);
  const {
    dialogState: loginDialogState,
    openDialog: openLoginDialog,
    closeDialog: closeLoginDialog,
  } = useConfirmDialog();
  const [isLikeInProgress, setIsLikeInProgress] = useState(false);
  const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const hasCurrentVersion = skill.currentVersion !== null;

  const executeLikeToggle = useCallback(async () => {
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
  }, [skill.id, skill.name, skill.isLikedByMe, skill.totalLikes, publishLikeUpdate]);

  const signInThenLike = useCallback(async () => {
    setIsLikeInProgress(true);
    await signIn();

    const isNowAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isNowAuthenticated) {
      await executeLikeToggle();
      return;
    }

    setIsLikeInProgress(false);
  }, [signIn, executeLikeToggle]);

  const promptLoginForLike = useCallback(() => {
    openLoginDialog({
      title: 'Sign in required',
      message: 'You need to sign in to like skills. Would you like to sign in now?',
      confirmLabel: 'Sign in',
      isDangerous: false,
      onConfirm: () => {
        closeLoginDialog();
        void signInThenLike();
      },
    });
  }, [openLoginDialog, closeLoginDialog, signInThenLike]);

  const handleToggleLike = useCallback(async () => {
    if (!isAuthenticated) {
      promptLoginForLike();
      return;
    }
    await executeLikeToggle();
  }, [isAuthenticated, promptLoginForLike, executeLikeToggle]);

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
      triggerBrowserDownload(downloadInfo.downloadUrl);

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
    loginDialogState,
    closeLoginDialog,
  };
}

function triggerBrowserDownload(url: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = '';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
