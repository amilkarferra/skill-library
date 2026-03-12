import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Upload, Heart, MessageSquare, User, Box } from 'lucide-react';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import { TagList } from '../../shared/components/TagList';
import { fetchSkillVersionDownloadUrl } from '../skill-detail/skill-detail.service';
import type { Skill } from '../../shared/models/Skill';
import './SkillRowExpanded.css';

interface SkillRowExpandedProps {
  readonly skill: Skill;
}

const MAX_DESCRIPTION_LENGTH = 200;

export function SkillRowExpanded({ skill }: SkillRowExpandedProps) {
  const navigate = useNavigate();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const hasCurrentVersion = skill.currentVersion !== null;
  const isOwner = skill.myRole === 'owner';
  const isCollaborator = skill.myRole === 'collaborator';
  const canCreateVersion = isOwner || isCollaborator;
  const shouldShowReviewLink = isOwner && skill.collaborationMode === 'open';
  const roleBadgeLabel = buildRoleBadgeLabel(skill.myRole);
  const hasRoleBadge = roleBadgeLabel.length > 0;

  const handleViewDetails = useCallback(() => {
    navigate(`/skills/${skill.name}`);
  }, [navigate, skill.name]);

  const handleDownload = useCallback(async () => {
    const currentVersion = skill.currentVersion;
    const hasNoCurrentVersion = currentVersion === null;
    if (hasNoCurrentVersion) return;

    setDownloadError(null);
    try {
      const downloadInfo = await fetchSkillVersionDownloadUrl(skill.name, currentVersion);
      window.open(downloadInfo.downloadUrl, '_blank');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Download failed';
      setDownloadError(errorMessage);
    }
  }, [skill.name, skill.currentVersion]);

  const handleCreateVersion = useCallback(() => {
    navigate(`/skills/${skill.name}/new-version`);
  }, [navigate, skill.name]);

  const handleOpenReviewPanel = useCallback(() => {
    navigate('/panel/versions');
  }, [navigate]);

  const truncatedDescription = buildTruncatedDescription(
    skill.longDescription
  );
  const hasDownloadError = downloadError !== null;

  return (
    <div className="skill-row-expanded">
      <div className="skill-row-expanded-header">
        <div className="skill-row-expanded-heading">
          <span className="skill-row-expanded-name">{skill.displayName}</span>
          {hasRoleBadge && <span className="skill-row-expanded-role">{roleBadgeLabel}</span>}
        </div>
        <CollabModeBadge collaborationMode={skill.collaborationMode} />
      </div>
      <div className="skill-row-expanded-description-panel">
        <p className="skill-row-expanded-description">
          {truncatedDescription}
        </p>
      </div>
      <TagList tags={skill.tags} />
      <div className="skill-row-expanded-meta">
        <span className="skill-row-expanded-meta-item">
          <User size={13} />
          @{skill.ownerUsername}
        </span>
        <span className="skill-row-expanded-meta-item">
          <Box size={13} />
          {skill.categoryName}
        </span>
        <span className="skill-row-expanded-meta-item">
          <Heart size={13} />
          {skill.totalLikes} likes
        </span>
        <span className="skill-row-expanded-meta-item">
          <MessageSquare size={13} />
          {skill.totalComments} comments
        </span>
      </div>
      {hasDownloadError && (
        <p className="skill-row-expanded-error">{downloadError}</p>
      )}
      <div className="skill-row-expanded-actions">
        {hasCurrentVersion && (
          <button
            className="skill-row-expanded-btn skill-row-expanded-btn--primary"
            onClick={handleDownload}
          >
            <Download size={14} />
            Download
          </button>
        )}
        {canCreateVersion && (
          <button
            className="skill-row-expanded-btn skill-row-expanded-btn--secondary"
            onClick={handleCreateVersion}
          >
            <Upload size={14} />
            New version
          </button>
        )}
        <button
          className="skill-row-expanded-btn"
          onClick={handleViewDetails}
        >
          <Eye size={14} />
          View detail
        </button>
        {shouldShowReviewLink && (
          <button
            className="skill-row-expanded-btn"
            onClick={handleOpenReviewPanel}
          >
            <Upload size={14} />
            Review proposals
          </button>
        )}
      </div>
    </div>
  );
}

function buildTruncatedDescription(description: string): string {
  const isShortEnough = description.length <= MAX_DESCRIPTION_LENGTH;
  if (isShortEnough) return description;
  return description.slice(0, MAX_DESCRIPTION_LENGTH) + '...';
}

function buildRoleBadgeLabel(myRole: Skill['myRole']): string {
  if (myRole === 'owner') {
    return 'Owner';
  }

  if (myRole === 'collaborator') {
    return 'Collaborator';
  }

  return '';
}
