import { Link } from 'react-router-dom';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { TabBar } from '../../shared/components/TabBar';
import { SidebarLayout } from '../../shared/components/SidebarLayout';
import { NavigationSidebar } from '../../shared/components/NavigationSidebar';
import { SkillDetailHeader } from './SkillDetailHeader';
import { SkillEditForm } from './SkillEditForm';
import { OverviewTab } from './OverviewTab';
import { VersionsTab } from './VersionsTab';
import { CommentsTab } from './CommentsTab';
import { CollaboratorsTab } from './CollaboratorsTab';
import { SkillDetailSkeleton } from './SkillDetailSkeleton';
import { useSkillDetail } from './useSkillDetail';
import type { Skill } from '../../shared/models/Skill';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import type { Comment } from '../../shared/models/Comment';
import './SkillDetailPage.css';

interface SkillContentProps {
  readonly skill: Skill;
  readonly slug: string;
  readonly activeTab: string;
  readonly versions: SkillVersion[];
  readonly isEditing: boolean;
  readonly isAuthenticated: boolean;
  readonly isCollabRequesting: boolean;
  readonly isCollabRequestSent: boolean;
  readonly isSubmittingComment: boolean;
  readonly isUpdatingComment: boolean;
  readonly actionError: string | null;
  readonly currentUserId: number | null;
  readonly skillMarkdownContent: string;
  readonly commentsPagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly goToPage: (page: number) => void;
  };
  readonly comments: Comment[];
  readonly actions: SkillContentActions;
}

interface SkillContentActions {
  readonly handleSelectTab: (tabId: string) => void;
  readonly handleToggleLike: () => void;
  readonly handleVersionDownloaded: () => void;
  readonly handleSubmitComment: (text: string) => void;
  readonly handleEditComment: (id: number, text: string) => void;
  readonly handleDeleteComment: (id: number) => void;
  readonly handleRequestCollaboration: () => void;
  readonly handleRequestDeleteSkill: () => void;
  readonly handleStartEditing: () => void;
  readonly handleCancelEditing: () => void;
  readonly handleSaveSuccess: (updated: Skill) => void;
}

function buildSidebarContext(skill: Skill) {
  return {
    ownerUsername: skill.ownerUsername,
    currentVersion: skill.currentVersion,
    totalDownloads: skill.totalDownloads,
    totalLikes: skill.totalLikes,
  };
}

export function SkillDetailPage() {
  const { state, actions } = useSkillDetail();

  if (state.isLoading) {
    return (
      <SidebarLayout sidebar={<NavigationSidebar skillContext={null} />}>
        <SkillDetailSkeleton />
      </SidebarLayout>
    );
  }

  const isRouteInvalid = state.slug === undefined;
  if (isRouteInvalid) {
    return (
      <SidebarLayout sidebar={<NavigationSidebar skillContext={null} />}>
        <div className="skill-detail-error">Invalid route</div>
      </SidebarLayout>
    );
  }

  const hasLoadError = state.loadError !== null;
  if (hasLoadError) {
    return (
      <SidebarLayout sidebar={<NavigationSidebar skillContext={null} />}>
        <div className="skill-detail-error">{state.loadError}</div>
      </SidebarLayout>
    );
  }

  const hasNoSkill = state.skill === null;
  if (hasNoSkill) {
    return (
      <SidebarLayout sidebar={<NavigationSidebar skillContext={null} />}>
        <div className="skill-detail-error">Skill not found</div>
      </SidebarLayout>
    );
  }

  const sidebarContext = buildSidebarContext(state.skill);

  return (
    <SidebarLayout
      sidebar={<NavigationSidebar skillContext={sidebarContext} />}
    >
      <SkillDetailContent
        skill={state.skill}
        slug={state.slug}
        activeTab={state.activeTab}
        versions={state.versions}
        isEditing={state.isEditing}
        isAuthenticated={state.isAuthenticated}
        isCollabRequesting={state.isCollabRequesting}
        isCollabRequestSent={state.isCollabRequestSent}
        isSubmittingComment={state.isSubmittingComment}
        isUpdatingComment={state.isUpdatingComment}
        actionError={state.actionError}
        currentUserId={state.currentUserId}
        skillMarkdownContent={state.skillMarkdownContent}
        commentsPagination={state.commentsPagination}
        comments={state.comments}
        actions={actions}
      />
      {state.dialogState.isOpen && (
        <ConfirmDialog
          title={state.dialogState.title}
          message={state.dialogState.message}
          confirmLabel={state.dialogState.confirmLabel}
          isDangerous={state.dialogState.isDangerous}
          onConfirm={state.dialogState.onConfirm}
          onCancel={actions.closeDialog}
        />
      )}
    </SidebarLayout>
  );
}

function SkillDetailContent({
  skill,
  slug,
  activeTab,
  versions,
  isEditing,
  isAuthenticated,
  isCollabRequesting,
  isCollabRequestSent,
  isSubmittingComment,
  isUpdatingComment,
  actionError,
  currentUserId,
  skillMarkdownContent,
  commentsPagination,
  comments,
  actions,
}: SkillContentProps) {
  const isOwner = skill.myRole === 'owner';
  const hasActionError = actionError !== null;

  const isOverviewActive = activeTab === 'overview';
  const isVersionsActive = activeTab === 'versions';
  const isCommentsActive = activeTab === 'comments';
  const isCollaboratorsActive = activeTab === 'collaborators';

  return (
    <div className="skill-detail">
      <SkillBreadcrumb
        displayName={skill.displayName}
        isOwner={isOwner}
        onEdit={actions.handleStartEditing}
        onDelete={actions.handleRequestDeleteSkill}
      />

      {isEditing ? (
        <SkillEditForm
          skill={skill}
          onSaveSuccess={actions.handleSaveSuccess}
          onCancel={actions.handleCancelEditing}
        />
      ) : (
        <SkillDetailHeader
          skill={skill}
          isAuthenticated={isAuthenticated}
          onToggleLike={actions.handleToggleLike}
          onRequestCollaboration={actions.handleRequestCollaboration}
          isCollabRequesting={isCollabRequesting}
          isCollabRequestSent={isCollabRequestSent}
        />
      )}

      {hasActionError && (
        <div className="skill-detail-action-error">{actionError}</div>
      )}

      <TabBar
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'versions', label: 'Versions', count: versions.length },
          { id: 'comments', label: 'Comments', count: skill.totalComments },
          { id: 'collaborators', label: 'Collaborators', count: skill.collaboratorsCount },
        ]}
        activeTabId={activeTab}
        onSelectTab={actions.handleSelectTab}
      />

      <div className="skill-detail-content">
        {isOverviewActive && (
          <OverviewTab markdownContent={skillMarkdownContent} />
        )}
        {isVersionsActive && (
          <VersionsTab
            versions={versions}
            slug={slug}
            onVersionDownloaded={actions.handleVersionDownloaded}
          />
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
            onSubmitComment={actions.handleSubmitComment}
            onEditComment={actions.handleEditComment}
            onDeleteComment={actions.handleDeleteComment}
          />
        )}
        {isCollaboratorsActive && (
          <CollaboratorsTab
            slug={slug}
            isOwner={isOwner}
            skillOwnerId={skill.ownerId}
          />
        )}
      </div>
    </div>
  );
}

interface SkillBreadcrumbProps {
  readonly displayName: string;
  readonly isOwner: boolean;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

function SkillBreadcrumb({ displayName, isOwner, onEdit, onDelete }: SkillBreadcrumbProps) {
  return (
    <div className="skill-detail-breadcrumb">
      <Link to="/" className="skill-detail-breadcrumb-link">
        Skills
      </Link>
      <ChevronRight size={12} className="skill-detail-breadcrumb-separator" />
      <span>{displayName}</span>
      {isOwner && (
        <Button variant="secondary" size="small" onClick={onEdit}>
          <Pencil size={12} />
          Edit
        </Button>
      )}
      {isOwner && (
        <Button variant="danger-outline" size="small" onClick={onDelete}>
          <Trash2 size={12} />
          Delete
        </Button>
      )}
    </div>
  );
}
