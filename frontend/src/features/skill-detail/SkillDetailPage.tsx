import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { useLikeStore } from '../../shared/stores/useLikeStore';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import { usePagination } from '../../shared/hooks/usePagination';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { OverviewTab } from './OverviewTab';
import { VersionsTab } from './VersionsTab';
import { CommentsTab } from './CommentsTab';
import { SkillSidebar } from './SkillSidebar';
import { del } from '../../shared/services/api.client';
import {
  fetchSkillBySlug,
  fetchSkillVersions,
  fetchSkillComments,
  fetchSkillContent,
  toggleSkillLike,
  postComment,
  updateComment,
  deleteComment,
  requestCollaboration,
} from './skill-detail.service';
import type { Skill } from '../../shared/models/Skill';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import type { Comment } from '../../shared/models/Comment';
import './SkillDetailPage.css';

type TabId = 'overview' | 'versions' | 'comments';

const COMMENTS_PAGE_SIZE = 15;

export function SkillDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const { publishLikeUpdate } = useLikeStore();
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [skillMarkdownContent, setSkillMarkdownContent] = useState('');
  const [versions, setVersions] = useState<SkillVersion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isCollabRequesting, setIsCollabRequesting] = useState(false);

  const commentsPagination = usePagination(COMMENTS_PAGE_SIZE);
  const { setTotalCount: setCommentsTotalCount } = commentsPagination;

  const loadSkillData = useCallback(async (skillSlug: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [skillData, versionsData, contentData] = await Promise.all([
        fetchSkillBySlug(skillSlug),
        fetchSkillVersions(skillSlug),
        fetchSkillContent(skillSlug),
      ]);
      setSkill(skillData);
      setVersions(versionsData);
      setSkillMarkdownContent(contentData.markdownContent);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load skill';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadComments = useCallback(async (
    skillSlug: string,
    page: number
  ) => {
    try {
      const commentsData = await fetchSkillComments(
        skillSlug,
        page,
        COMMENTS_PAGE_SIZE
      );
      setComments(commentsData.items);
      setCommentsTotalCount(commentsData.totalCount);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load comments';
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

  const handleSelectOverview = useCallback(() => {
    setActiveTab('overview');
  }, []);

  const handleSelectVersions = useCallback(() => {
    setActiveTab('versions');
  }, []);

  const handleSelectComments = useCallback(() => {
    setActiveTab('comments');
  }, []);

  const handleToggleLike = useCallback(async () => {
    if (skill === null || slug === undefined) return;

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
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to toggle like';
      setActionError(errorMessage);
    }
  }, [skill, slug, publishLikeUpdate]);

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
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to post comment';
      setActionError(errorMessage);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [slug, commentsPagination.currentPage, loadComments]);

  const handleEditComment = useCallback(async (
    commentId: number,
    commentText: string
  ) => {
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
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update comment';
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
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete comment';
      setActionError(errorMessage);
    }
  }, [slug, commentsPagination.currentPage, loadComments]);

  const handleRequestCollaboration = useCallback(async () => {
    if (slug === undefined) return;

    setIsCollabRequesting(true);
    setActionError(null);
    try {
      await requestCollaboration(slug);
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
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete skill';
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

  if (isLoading) {
    return <div className="skill-detail-loading">Loading skill...</div>;
  }

  const isRouteInvalid = slug === undefined;
  if (isRouteInvalid) {
    return <div className="skill-detail-error">Invalid route</div>;
  }

  const hasLoadError = loadError !== null;
  if (hasLoadError) {
    return <div className="skill-detail-error">{loadError}</div>;
  }

  const hasNoSkill = skill === null;
  if (hasNoSkill) {
    return <div className="skill-detail-error">Skill not found</div>;
  }

  const isOverviewActive = activeTab === 'overview';
  const isVersionsActive = activeTab === 'versions';
  const isCommentsActive = activeTab === 'comments';

  const currentUserId = user?.id ?? null;
  const hasActionError = actionError !== null;

  const overviewTabClass = isOverviewActive
    ? 'skill-detail-tab skill-detail-tab--active'
    : 'skill-detail-tab';

  const versionsTabClass = isVersionsActive
    ? 'skill-detail-tab skill-detail-tab--active'
    : 'skill-detail-tab';

  const commentsTabClass = isCommentsActive
    ? 'skill-detail-tab skill-detail-tab--active'
    : 'skill-detail-tab';

  return (
    <div className="skill-detail">
      <div className="skill-detail-header">
        <div className="skill-detail-breadcrumb">
          <Link to="/" className="skill-detail-breadcrumb-link">
            Skills
          </Link>
          <ChevronRight size={12} className="skill-detail-breadcrumb-separator" />
          <span>{skill.displayName}</span>
        </div>
        <h1 className="skill-detail-title">{skill.displayName}</h1>
        <p className="skill-detail-subtitle">{skill.shortDescription}</p>
      </div>

      {hasActionError && (
        <div className="skill-detail-action-error">{actionError}</div>
      )}

      <div className="skill-detail-body">
        <div className="skill-detail-main">
          <div className="skill-detail-tabs">
            <button
              className={overviewTabClass}
              onClick={handleSelectOverview}
            >
              Overview
            </button>
            <button
              className={versionsTabClass}
              onClick={handleSelectVersions}
            >
              Versions ({versions.length})
            </button>
            <button
              className={commentsTabClass}
              onClick={handleSelectComments}
            >
              Comments ({skill.totalComments})
            </button>
          </div>

          <div className="skill-detail-tab-content">
            {isOverviewActive && (
              <OverviewTab markdownContent={skillMarkdownContent} />
            )}
            {isVersionsActive && (
              <VersionsTab versions={versions} slug={slug} />
            )}
            {isCommentsActive && (
              <CommentsTab
                comments={comments}
                currentPage={commentsPagination.currentPage}
                totalPages={commentsPagination.totalPages}
                isAuthenticated={isAuthenticated}
                isSubmitting={isSubmittingComment}
                isUpdating={isUpdatingComment}
                currentUserId={currentUserId}
                skillOwnerId={skill.ownerId}
                onPageChange={commentsPagination.goToPage}
                onSubmitComment={handleSubmitComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
              />
            )}
          </div>
        </div>

        <SkillSidebar
          skill={skill}
          slug={slug}
          isAuthenticated={isAuthenticated}
          onToggleLike={handleToggleLike}
          onRequestCollaboration={handleRequestCollaboration}
          onDelete={handleRequestDeleteSkill}
          isCollabRequesting={isCollabRequesting}
        />
      </div>

      {dialogState.isOpen && (
        <ConfirmDialog
          title={dialogState.title}
          message={dialogState.message}
          confirmLabel={dialogState.confirmLabel}
          isDangerous={dialogState.isDangerous}
          onConfirm={dialogState.onConfirm}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
