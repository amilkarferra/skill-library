import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { useLikeStore } from '../../shared/stores/useLikeStore';
import { useDownloadStore } from '../../shared/stores/useDownloadStore';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import { usePagination } from '../../shared/hooks/usePagination';
import { del } from '../../shared/services/api.client';
import {
  fetchSkillBySlug,
  fetchSkillVersions,
  fetchSkillComments,
  fetchSkillContent,
  postComment,
  updateComment,
  deleteComment,
  requestCollaboration,
} from './skill-detail.service';
import { toggleSkillLike } from '../../shared/services/skill-actions.service';
import type { Skill } from '../../shared/models/Skill';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import type { Comment } from '../../shared/models/Comment';

type TabId = 'overview' | 'versions' | 'comments' | 'collaborators';

const COMMENTS_PAGE_SIZE = 15;

const VALID_TABS: ReadonlySet<string> = new Set([
  'overview', 'versions', 'comments', 'collaborators',
]);

function resolveInitialTab(searchParams: URLSearchParams): TabId {
  const tabParam = searchParams.get('tab') ?? '';
  const isValidTab = VALID_TABS.has(tabParam);
  return isValidTab ? (tabParam as TabId) : 'overview';
}

interface SkillDetailState {
  readonly slug: string | undefined;
  readonly skill: Skill | null;
  readonly skillMarkdownContent: string;
  readonly versions: SkillVersion[];
  readonly comments: Comment[];
  readonly activeTab: TabId;
  readonly isLoading: boolean;
  readonly loadError: string | null;
  readonly actionError: string | null;
  readonly isSubmittingComment: boolean;
  readonly isUpdatingComment: boolean;
  readonly isCollabRequesting: boolean;
  readonly isCollabRequestSent: boolean;
  readonly isEditing: boolean;
  readonly isAuthenticated: boolean;
  readonly currentUserId: number | null;
  readonly commentsPagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly goToPage: (page: number) => void;
  };
  readonly dialogState: {
    readonly isOpen: boolean;
    readonly title: string;
    readonly message: string;
    readonly confirmLabel: string;
    readonly isDangerous: boolean;
    readonly onConfirm: () => void;
  };
}

interface SkillDetailActions {
  readonly handleSelectTab: (tabId: string) => void;
  readonly handleToggleLike: () => void;
  readonly handleVersionDownloaded: () => void;
  readonly handleSubmitComment: (commentText: string) => void;
  readonly handleEditComment: (commentId: number, commentText: string) => void;
  readonly handleDeleteComment: (commentId: number) => void;
  readonly handleRequestCollaboration: () => void;
  readonly handleRequestDeleteSkill: () => void;
  readonly handleStartEditing: () => void;
  readonly handleCancelEditing: () => void;
  readonly handleSaveSuccess: (updatedSkill: Skill) => void;
  readonly closeDialog: () => void;
}

interface SkillDetailResult {
  readonly state: SkillDetailState;
  readonly actions: SkillDetailActions;
}

export function useSkillDetail(): SkillDetailResult {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { signIn } = useAuth();

  const { publishLikeUpdate } = useLikeStore();
  const { lastDownloadUpdate } = useDownloadStore();
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [skillMarkdownContent, setSkillMarkdownContent] = useState('');
  const [versions, setVersions] = useState<SkillVersion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const initialTab = resolveInitialTab(searchParams);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isCollabRequesting, setIsCollabRequesting] = useState(false);
  const [isCollabRequestSent, setIsCollabRequestSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const commentsPagination = usePagination(COMMENTS_PAGE_SIZE);
  const { setTotalCount: setCommentsTotalCount } = commentsPagination;

  const loadSkillData = useCallback(async (skillSlug: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [skillResponse, versionsResponse, contentResponse] = await Promise.all([
        fetchSkillBySlug(skillSlug),
        fetchSkillVersions(skillSlug),
        fetchSkillContent(skillSlug),
      ]);
      setSkill(skillResponse);
      setVersions(versionsResponse);
      setSkillMarkdownContent(contentResponse.markdownContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load skill';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadComments = useCallback(async (skillSlug: string, page: number) => {
    try {
      const commentsResponse = await fetchSkillComments(skillSlug, page, COMMENTS_PAGE_SIZE);
      setComments(commentsResponse.items);
      setCommentsTotalCount(commentsResponse.totalCount);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
      setActionError(errorMessage);
    }
  }, [setCommentsTotalCount]);

  useEffect(() => {
    if (slug === undefined) return;
    loadSkillData(slug);
  }, [slug, loadSkillData]);

  useEffect(() => {
    if (slug === undefined) return;
    loadComments(slug, commentsPagination.currentPage);
  }, [slug, commentsPagination.currentPage, loadComments]);

  useEffect(() => {
    const isEditRequested = searchParams.get('edit') === 'true';
    if (isEditRequested) {
      setIsEditing(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const hasNoUpdate = lastDownloadUpdate === null;
    if (hasNoUpdate) return;

    setSkill((previous) => {
      if (previous === null) return null;
      const isCurrentSkill = previous.id === lastDownloadUpdate.skillId;
      if (!isCurrentSkill) return previous;
      return { ...previous, totalDownloads: lastDownloadUpdate.totalDownloads };
    });
  }, [lastDownloadUpdate]);

  const handleVersionDownloaded = useCallback(() => {
    setSkill((previous) => {
      if (previous === null) return null;
      return { ...previous, totalDownloads: previous.totalDownloads + 1 };
    });
  }, []);

  const handleSelectTab = useCallback((tabId: string) => {
    setActiveTab(tabId as TabId);
  }, []);

  const handleToggleLike = useCallback(async () => {
    if (skill === null || slug === undefined) return;

    if (!isAuthenticated) {
      await signIn();
      return;
    }

    const currentlyLiked = skill.isLikedByMe === true;
    setActionError(null);
    try {
      await toggleSkillLike(slug, currentlyLiked);
      const likesDelta = currentlyLiked ? -1 : 1;
      const updatedTotalLikes = skill.totalLikes + likesDelta;
      const updatedIsLiked = !currentlyLiked;

      setSkill((previous) => {
        const hasNoPrevious = previous === null;
        if (hasNoPrevious) return null;
        return {
          ...previous,
          isLikedByMe: updatedIsLiked,
          totalLikes: updatedTotalLikes,
        };
      });

      publishLikeUpdate({
        skillId: skill.id,
        isLiked: updatedIsLiked,
        totalLikes: updatedTotalLikes,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle like';
      setActionError(errorMessage);
    }
  }, [skill, slug, isAuthenticated, signIn, publishLikeUpdate]);

  const handleSubmitComment = useCallback(async (commentText: string) => {
    if (slug === undefined) return;

    setIsSubmittingComment(true);
    setActionError(null);
    try {
      await postComment(slug, commentText);
      await loadComments(slug, commentsPagination.currentPage);
      setSkill((previous) => {
        const hasNoPrevious = previous === null;
        if (hasNoPrevious) return null;
        return { ...previous, totalComments: previous.totalComments + 1 };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to post comment';
      setActionError(errorMessage);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [slug, commentsPagination.currentPage, loadComments]);

  const handleEditComment = useCallback(async (commentId: number, commentText: string) => {
    if (slug === undefined) return;

    setIsUpdatingComment(true);
    setActionError(null);
    try {
      const updatedComment = await updateComment(slug, commentId, commentText);
      setComments((previous) =>
        previous.map((existingComment) => {
          const isTargetComment = existingComment.id === commentId;
          return isTargetComment ? updatedComment : existingComment;
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
      setActionError(errorMessage);
    } finally {
      setIsUpdatingComment(false);
    }
  }, [slug]);

  const handleDeleteComment = useCallback(async (commentId: number) => {
    if (slug === undefined) return;

    setActionError(null);
    try {
      await deleteComment(slug, commentId);
      await loadComments(slug, commentsPagination.currentPage);
      setSkill((previous) => {
        const hasNoPrevious = previous === null;
        if (hasNoPrevious) return null;
        return { ...previous, totalComments: Math.max(0, previous.totalComments - 1) };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      setActionError(errorMessage);
    }
  }, [slug, commentsPagination.currentPage, loadComments]);

  const handleRequestCollaboration = useCallback(async () => {
    if (slug === undefined) return;

    setIsCollabRequesting(true);
    setActionError(null);
    try {
      await requestCollaboration(slug);
      setIsCollabRequestSent(true);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to send collaboration request';
      setActionError(errorMessage);
    } finally {
      setIsCollabRequesting(false);
    }
  }, [slug]);

  const executeDeleteSkill = useCallback(async () => {
    if (slug === undefined) return;

    try {
      await del<void>(`/skills/${slug}`);
      closeDialog();
      navigate('/');
    } catch (error) {
      closeDialog();
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete skill';
      setActionError(errorMessage);
    }
  }, [slug, closeDialog, navigate]);

  const handleRequestDeleteSkill = useCallback(() => {
    const hasNoSkill = skill === null;
    if (hasNoSkill) return;

    openDialog({
      title: 'Delete skill',
      message: `Are you sure you want to delete "${skill.displayName}"? The skill will be deactivated but can be restored later.`,
      confirmLabel: 'Delete',
      isDangerous: true,
      onConfirm: () => { void executeDeleteSkill(); },
    });
  }, [skill, openDialog, executeDeleteSkill]);

  const clearEditQueryParam = useCallback(() => {
    setSearchParams((previous) => {
      const updated = new URLSearchParams(previous);
      updated.delete('edit');
      return updated;
    }, { replace: true });
  }, [setSearchParams]);

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    clearEditQueryParam();
  }, [clearEditQueryParam]);

  const handleSaveSuccess = useCallback(
    (updatedSkill: Skill) => {
      setSkill(updatedSkill);
      setIsEditing(false);

      const hasSlugChanged = updatedSkill.name !== slug;
      if (hasSlugChanged) {
        navigate(`/skills/${updatedSkill.name}`, { replace: true });
        return;
      }

      clearEditQueryParam();
    },
    [slug, navigate, clearEditQueryParam]
  );

  const currentUserId = user?.id ?? null;

  return {
    state: {
      slug,
      skill,
      skillMarkdownContent,
      versions,
      comments,
      activeTab,
      isLoading,
      loadError,
      actionError,
      isSubmittingComment,
      isUpdatingComment,
      isCollabRequesting,
      isCollabRequestSent,
      isEditing,
      isAuthenticated,
      currentUserId,
      commentsPagination: {
        currentPage: commentsPagination.currentPage,
        totalPages: commentsPagination.totalPages,
        goToPage: commentsPagination.goToPage,
      },
      dialogState,
    },
    actions: {
      handleSelectTab,
      handleToggleLike,
      handleVersionDownloaded,
      handleSubmitComment,
      handleEditComment,
      handleDeleteComment,
      handleRequestCollaboration,
      handleRequestDeleteSkill,
      handleStartEditing,
      handleCancelEditing,
      handleSaveSuccess,
      closeDialog,
    },
  };
}
