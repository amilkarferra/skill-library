import { useCallback } from 'react';
import {
  Download,
  Heart,
  ArrowDownToLine,
  MessageSquare,
  Users,
} from 'lucide-react';
import { fetchSkillVersionDownloadUrl } from './skill-detail.service';
import { TagList } from '../../shared/components/TagList';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import type { Skill } from '../../shared/models/Skill';
import './SkillSidebar.css';

interface SkillSidebarProps {
  readonly skill: Skill;
  readonly slug: string;
  readonly isAuthenticated: boolean;
  readonly onToggleLike: () => void;
  readonly onRequestCollaboration: () => void;
  readonly isCollabRequesting: boolean;
}

export function SkillSidebar({
  skill,
  slug,
  isAuthenticated,
  onToggleLike,
  onRequestCollaboration,
  isCollabRequesting,
}: SkillSidebarProps) {
  const isLiked = skill.isLikedByMe === true;
  const isOwner = skill.myRole === 'owner';
  const isCollaborator = skill.myRole === 'collaborator';
  const canRequestCollab = isAuthenticated && !isOwner && !isCollaborator;
  const isOpenCollab = skill.collaborationMode === 'open';
  const hasCurrentVersion = skill.currentVersion !== null;

  const likeButtonClass = isLiked
    ? 'skill-sidebar-like skill-sidebar-like--active'
    : 'skill-sidebar-like';

  const handleDownload = useCallback(async () => {
    const currentVersion = skill.currentVersion;
    const hasNoCurrentVersion = currentVersion === null;
    if (hasNoCurrentVersion) return;
    const downloadInfo = await fetchSkillVersionDownloadUrl(slug, currentVersion);
    window.open(downloadInfo.downloadUrl, '_blank');
  }, [slug, skill.currentVersion]);

  return (
    <aside className="skill-sidebar">
      {hasCurrentVersion && (
        <button
          className="skill-sidebar-download"
          onClick={handleDownload}
        >
          <Download size={16} />
          Download v{skill.currentVersion}
        </button>
      )}

      {isAuthenticated && (
        <button className={likeButtonClass} onClick={onToggleLike}>
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          {isLiked ? 'Liked' : 'Like'}
        </button>
      )}

      <div className="skill-sidebar-stats">
        <div className="skill-sidebar-stat">
          <span className="skill-sidebar-stat-label">
            <ArrowDownToLine size={12} /> Downloads
          </span>
          <span className="skill-sidebar-stat-value">
            {skill.totalDownloads}
          </span>
        </div>
        <div className="skill-sidebar-stat">
          <span className="skill-sidebar-stat-label">
            <Heart size={12} /> Likes
          </span>
          <span className="skill-sidebar-stat-value">
            {skill.totalLikes}
          </span>
        </div>
        <div className="skill-sidebar-stat">
          <span className="skill-sidebar-stat-label">
            <MessageSquare size={12} /> Comments
          </span>
          <span className="skill-sidebar-stat-value">
            {skill.totalComments}
          </span>
        </div>
      </div>

      <div className="skill-sidebar-section">
        <span className="skill-sidebar-section-label">Category</span>
        <span className="skill-sidebar-section-value">
          {skill.categoryName}
        </span>
      </div>

      {hasCurrentVersion && (
        <div className="skill-sidebar-section">
          <span className="skill-sidebar-section-label">Version</span>
          <span className="skill-sidebar-section-value">
            {skill.currentVersion}
          </span>
        </div>
      )}

      <div className="skill-sidebar-section">
        <span className="skill-sidebar-section-label">Collaboration</span>
        <CollabModeBadge collaborationMode={skill.collaborationMode} />
      </div>

      <div className="skill-sidebar-section">
        <span className="skill-sidebar-section-label">Tags</span>
        <TagList tags={skill.tags} />
      </div>

      <div className="skill-sidebar-section">
        <span className="skill-sidebar-section-label">Owner</span>
        <div className="skill-sidebar-owner">
          <span className="skill-sidebar-owner-name">
            {skill.ownerDisplayName}
          </span>
          <span className="skill-sidebar-owner-username">
            @{skill.ownerUsername}
          </span>
        </div>
      </div>

      {canRequestCollab && isOpenCollab && (
        <button
          className="skill-sidebar-collab-request"
          onClick={onRequestCollaboration}
          disabled={isCollabRequesting}
        >
          <Users size={14} />
          Request Collaboration
        </button>
      )}
    </aside>
  );
}
