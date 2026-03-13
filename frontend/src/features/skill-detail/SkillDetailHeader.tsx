import { Download, Heart, MessageSquare, ArrowDownToLine, Users } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { TagList } from '../../shared/components/TagList';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import { StatCard } from '../../shared/components/StatCard';
import { useSkillActions } from '../../shared/hooks/useSkillActions';
import type { Skill } from '../../shared/models/Skill';
import './SkillDetailHeader.css';

interface SkillDetailHeaderProps {
  readonly skill: Skill;
  readonly isAuthenticated: boolean;
  readonly onToggleLike: () => void;
  readonly onRequestCollaboration: () => void;
  readonly isCollabRequesting: boolean;
}

export function SkillDetailHeader({
  skill,
  isAuthenticated,
  onToggleLike,
  onRequestCollaboration,
  isCollabRequesting,
}: SkillDetailHeaderProps) {
  const { handleDownload } = useSkillActions(skill);
  const isLiked = skill.isLikedByMe === true;
  const isOwner = skill.myRole === 'owner';
  const isCollaborator = skill.myRole === 'collaborator';
  const hasCurrentVersion = skill.currentVersion !== null;
  const canRequestCollab = isAuthenticated && !isOwner && !isCollaborator;
  const isOpenCollab = skill.collaborationMode === 'open';
  const shouldShowCollabButton = canRequestCollab && isOpenCollab;

  const likeButtonClass = isLiked
    ? 'detail-header-like detail-header-like--active'
    : 'detail-header-like';

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
          {isAuthenticated && (
            <button className={likeButtonClass} onClick={onToggleLike}>
              <Heart
                size={16}
                fill={isLiked ? 'currentColor' : 'none'}
              />
              {isLiked ? 'Liked' : 'Like'}
            </button>
          )}
          {shouldShowCollabButton && (
            <Button
              variant="secondary"
              onClick={onRequestCollaboration}
              disabled={isCollabRequesting}
            >
              <Users size={14} />
              Collaborate
            </Button>
          )}
        </div>
      </div>

      <div className="detail-header-meta">
        <span className="detail-header-meta-item">
          by{' '}
          <a
            href={`/?author=${skill.ownerUsername}`}
            className="detail-header-meta-link"
          >
            @{skill.ownerUsername}
          </a>
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
    </header>
  );
}
