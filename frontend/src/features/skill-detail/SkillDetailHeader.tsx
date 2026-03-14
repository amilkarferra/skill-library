import { Download, Heart, MessageSquare, ArrowDownToLine, Users, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { TagList } from '../../shared/components/TagList';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import { RoleBadge } from '../../shared/components/RoleBadge';
import { StatCard } from '../../shared/components/StatCard';
import { useSkillActions } from '../../shared/hooks/useSkillActions';
import type { Skill } from '../../shared/models/Skill';
import './SkillDetailHeader.css';

interface SkillDetailHeaderProps {
  readonly skill: Skill;
  readonly isAuthenticated: boolean;
  readonly onRequestCollaboration: () => void;
  readonly isCollabRequesting: boolean;
  readonly isCollabRequestSent: boolean;
}

export function SkillDetailHeader({
  skill,
  isAuthenticated,
  onRequestCollaboration,
  isCollabRequesting,
  isCollabRequestSent,
}: SkillDetailHeaderProps) {
  const {
    handleDownload,
    handleToggleLike,
    isLikeInProgress,
    loginDialogState,
    closeLoginDialog,
  } = useSkillActions(skill);
  const isLiked = skill.isLikedByMe === true;
  const isOwner = skill.myRole === 'owner';
  const isCollaborator = skill.myRole === 'collaborator';
  const hasCurrentVersion = skill.currentVersion !== null;
  const canRequestCollab = isAuthenticated && !isOwner && !isCollaborator;
  const isOpenCollab = skill.collaborationMode === 'open';
  const shouldShowCollabButton = canRequestCollab && isOpenCollab;

  const likeVariant = isLiked ? 'like-active' : 'like';
  const likeLabel = isLiked ? 'Liked' : 'Like';
  const likeIconFill = isLiked ? 'currentColor' : 'none';

  return (
    <header className="detail-header">
      <div className="detail-header-top">
        <div className="detail-header-identity">
          <h1 className="detail-header-title">{skill.displayName}</h1>
          <p className="detail-header-description">
            {skill.shortDescription}
          </p>
        </div>
        <div className="detail-header-actions">
          {hasCurrentVersion && handleDownload !== null && (
            <Button variant="download" onClick={handleDownload}>
              <Download size={16} />
              Download v{skill.currentVersion}
            </Button>
          )}
          <Button variant={likeVariant} onClick={handleToggleLike} isLoading={isLikeInProgress}>
            <Heart size={16} fill={likeIconFill} />
            {likeLabel}
          </Button>
          {shouldShowCollabButton && !isCollabRequestSent && (
            <Button
              variant="secondary"
              onClick={onRequestCollaboration}
              disabled={isCollabRequesting}
            >
              <Users size={14} />
              {isCollabRequesting ? 'Sending...' : 'Collaborate'}
            </Button>
          )}
          {shouldShowCollabButton && isCollabRequestSent && (
            <Button variant="success" disabled>
              <Check size={14} />
              Request Sent
            </Button>
          )}
        </div>
      </div>

      <div className="detail-header-meta">
        <span className="detail-header-meta-item">
          by{' '}
          <Link
            to={`/?author=${skill.ownerUsername}`}
            className="detail-header-meta-link"
          >
            @{skill.ownerUsername}
          </Link>
        </span>
        <span className="detail-header-meta-dot" />
        <span className="detail-header-meta-item">
          {skill.categoryName}
        </span>
        {hasCurrentVersion && (
          <>
            <span className="detail-header-meta-dot" />
            <span className="detail-header-meta-item">
              v{skill.currentVersion}
            </span>
          </>
        )}
        <span className="detail-header-meta-dot" />
        <CollabModeBadge collaborationMode={skill.collaborationMode} />
        <RoleBadge role={skill.myRole} />
      </div>

      <div className="detail-header-stats">
        <StatCard
          icon={<ArrowDownToLine size={16} />}
          formattedValue={skill.totalDownloads.toLocaleString()}
          label="Downloads"
        />
        <StatCard
          icon={<Heart size={16} />}
          formattedValue={skill.totalLikes.toLocaleString()}
          label="Likes"
        />
        <StatCard
          icon={<MessageSquare size={16} />}
          formattedValue={skill.totalComments.toLocaleString()}
          label="Comments"
        />
      </div>

      <TagList tags={skill.tags} />

      {loginDialogState.isOpen && (
        <ConfirmDialog
          title={loginDialogState.title}
          message={loginDialogState.message}
          confirmLabel={loginDialogState.confirmLabel}
          isDangerous={loginDialogState.isDangerous}
          onConfirm={loginDialogState.onConfirm}
          onCancel={closeLoginDialog}
        />
      )}
    </header>
  );
}
