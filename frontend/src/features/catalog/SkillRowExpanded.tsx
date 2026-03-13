import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Upload, Heart, MessageSquare, User, Box, Trash2 } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { TagList } from '../../shared/components/TagList';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import { del } from '../../shared/services/api.client';
import { fetchSkillVersionDownloadUrl } from '../skill-detail/skill-detail.service';
import type { Skill } from '../../shared/models/Skill';
import './SkillRowExpanded.css';

interface SkillRowExpandedProps {
  readonly skill: Skill;
  readonly onSkillDeleted?: (skillId: number) => void;
}

const MAX_DESCRIPTION_LENGTH = 200;

export function SkillRowExpanded({ skill, onSkillDeleted }: SkillRowExpandedProps) {
  const navigate = useNavigate();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();
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

  const handleDeleteSkill = useCallback(async () => {
    setActionError(null);
    try {
      await del<void>(`/skills/${skill.name}`);
      closeDialog();
      onSkillDeleted?.(skill.id);
    } catch (error) {
      closeDialog();
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete skill';
      setActionError(errorMessage);
    }
  }, [skill.name, skill.id, closeDialog, onSkillDeleted]);

  const handleRequestDelete = useCallback(() => {
    openDialog({
      title: 'Delete skill',
      message: `Are you sure you want to delete "${skill.displayName}"? The skill will be deactivated but can be restored later.`,
      confirmLabel: 'Delete',
      isDangerous: true,
      onConfirm: () => { void handleDeleteSkill(); },
    });
  }, [openDialog, skill.displayName, handleDeleteSkill]);

  const truncatedDescription = buildTruncatedDescription(
    skill.longDescription
  );
  const hasDownloadError = downloadError !== null;
  const hasActionError = actionError !== null;

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
      {hasActionError && (
        <p className="skill-row-expanded-error">{actionError}</p>
      )}
      <div className="skill-row-expanded-actions">
        {hasCurrentVersion && (
          <Button variant="primary" size="small" onClick={handleDownload}>
            <Download size={14} />
            Download
          </Button>
        )}
        {canCreateVersion && (
          <Button variant="download" size="small" onClick={handleCreateVersion}>
            <Upload size={14} />
            New version
          </Button>
        )}
        <Button variant="secondary" size="small" onClick={handleViewDetails}>
          <Eye size={14} />
          View detail
        </Button>
        {shouldShowReviewLink && (
          <Button variant="secondary" size="small" onClick={handleOpenReviewPanel}>
            <Upload size={14} />
            Review proposals
          </Button>
        )}
        {isOwner && (
          <>
            <span className="skill-row-expanded-spacer" />
            <Button variant="danger-outline" size="small" onClick={handleRequestDelete}>
              <Trash2 size={14} />
              Delete
            </Button>
          </>
        )}
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
