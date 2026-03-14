import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Upload, User, Box, Calendar, UserPlus, Users, Trash2, Check } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { TagList } from '../../shared/components/TagList';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import { useSkillActions } from '../../shared/hooks/useSkillActions';
import { useAuthGuard } from '../../shared/hooks/useAuthGuard';
import { formatDate } from '../../shared/formatters/format-date';
import { formatCollaboratorsLabel } from '../../shared/formatters/format-collaborators-label';
import { del, post } from '../../shared/services/api.client';
import { RoleBadge } from '../../shared/components/RoleBadge';
import type { Skill } from '../../shared/models/Skill';
import './SkillRowExpanded.css';

interface SkillRowExpandedProps {
  readonly skill: Skill;
  readonly onSkillDeleted?: (skillId: number) => void;
}

const MAX_DESCRIPTION_LENGTH = 200;
const ACTION_ICON_SIZE = 12;

export function SkillRowExpanded({
  skill,
  onSkillDeleted,
}: SkillRowExpandedProps) {
  const navigate = useNavigate();
  const { handleDownload, downloadError } = useSkillActions(skill);
  const [actionError, setActionError] = useState<string | null>(null);
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();
  const { guardWithLogin, loginDialogState: collabLoginDialogState, closeLoginDialog: closeCollabLoginDialog } = useAuthGuard();
  const [isCollabRequesting, setIsCollabRequesting] = useState(false);
  const [isCollabRequestSent, setIsCollabRequestSent] = useState(false);
  const hasCurrentVersion = skill.currentVersion !== null;
  const isOwner = skill.myRole === 'owner';
  const isCollaborator = skill.myRole === 'collaborator';
  const canCreateVersion = isOwner || isCollaborator;
  const isOpenCollab = skill.collaborationMode === 'open';
  const canRequestCollab = !isOwner && !isCollaborator && isOpenCollab;
  const shouldShowReviewLink = isOwner && isOpenCollab;
  const hasCollaborators = skill.collaboratorsCount > 0;
  const collaboratorsLabel = formatCollaboratorsLabel(skill.collaboratorsCount);
  const handleViewDetails = useCallback(() => {
    navigate(`/skills/${skill.name}`);
  }, [navigate, skill.name]);

  const handleCreateVersion = useCallback(() => {
    navigate(`/skills/${skill.name}/new-version`);
  }, [navigate, skill.name]);

  const handleOpenReviewPanel = useCallback(() => {
    navigate('/panel/versions');
  }, [navigate]);

  const handleOpenCollaborators = useCallback(() => {
    navigate(`/skills/${skill.name}?tab=collaborators`);
  }, [navigate, skill.name]);

  const handleDeleteSkill = useCallback(async () => {
    setActionError(null);
    try {
      await del<void>(`/skills/${skill.name}`);
      closeDialog();
      onSkillDeleted?.(skill.id);
    } catch (error) {
      closeDialog();
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete skill';
      setActionError(errorMessage);
    }
  }, [skill.name, skill.id, closeDialog, onSkillDeleted]);

  const executeRequestCollaboration = useCallback(async () => {
    setIsCollabRequesting(true);
    setActionError(null);
    try {
      await post<void>(`/skills/${skill.name}/collaboration-requests`);
      setIsCollabRequestSent(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send collaboration request';
      setActionError(errorMessage);
    } finally {
      setIsCollabRequesting(false);
    }
  }, [skill.name]);

  const handleRequestCollaboration = guardWithLogin({
    message: 'You need to sign in to request collaboration. Would you like to sign in now?',
    onAuthenticated: executeRequestCollaboration,
  });

  const handleRequestDelete = useCallback(() => {
    openDialog({
      title: 'Delete skill',
      message: `Are you sure you want to delete "${skill.displayName}"? The skill will be deactivated but can be restored later.`,
      confirmLabel: 'Delete',
      isDangerous: true,
      onConfirm: () => {
        void handleDeleteSkill();
      },
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
          <span className="skill-row-expanded-name">
            {skill.displayName}
          </span>
          <RoleBadge role={skill.myRole} />
        </div>
      </div>
      <div className="skill-row-expanded-description-panel">
        <p className="skill-row-expanded-description">
          {truncatedDescription}
        </p>
      </div>
      <TagList tags={skill.tags} />
      <div className="skill-row-expanded-meta">
        <span className="skill-row-expanded-meta-item">
          <User size={12} />
          <strong className="skill-row-expanded-meta-value">
            @{skill.ownerUsername}
          </strong>
        </span>
        <span className="skill-row-expanded-meta-item">
          <Box size={12} />
          <strong className="skill-row-expanded-meta-value">
            {skill.categoryName}
          </strong>
        </span>
        <span className="skill-row-expanded-meta-item">
          <Calendar size={12} />
          <strong className="skill-row-expanded-meta-value">
            {formatDate(skill.createdAt)}
          </strong>
        </span>
        <span className="skill-row-expanded-meta-item">
          <UserPlus size={12} />
          <strong className="skill-row-expanded-meta-value">
            {buildCollaborationModeLabel(skill.collaborationMode)}
          </strong>
        </span>
        {hasCollaborators && (
          <span className="skill-row-expanded-meta-item">
            <Users size={12} />
            <strong className="skill-row-expanded-meta-value">
              {collaboratorsLabel}
            </strong>
          </span>
        )}
      </div>
      {hasDownloadError && (
        <p className="skill-row-expanded-error">{downloadError}</p>
      )}
      {hasActionError && (
        <p className="skill-row-expanded-error">{actionError}</p>
      )}
      <div className="skill-row-expanded-actions">
        {hasCurrentVersion && (
          <Button
            variant="primary"
            size="small"
            onClick={handleDownload!}
          >
            <Download size={ACTION_ICON_SIZE} />
            Download
          </Button>
        )}
        {canCreateVersion && (
          <Button
            variant="download"
            size="small"
            onClick={handleCreateVersion}
          >
            <Upload size={ACTION_ICON_SIZE} />
            New version
          </Button>
        )}
        <Button
          variant="secondary"
          size="small"
          onClick={handleViewDetails}
        >
          <Eye size={ACTION_ICON_SIZE} />
          View detail
        </Button>
        {canRequestCollab && !isCollabRequestSent && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleRequestCollaboration}
            disabled={isCollabRequesting}
          >
            <Users size={ACTION_ICON_SIZE} />
            {isCollabRequesting ? 'Sending...' : 'Collaborate'}
          </Button>
        )}
        {canRequestCollab && isCollabRequestSent && (
          <Button variant="success" size="small" disabled>
            <Check size={ACTION_ICON_SIZE} />
            Request Sent
          </Button>
        )}
        {isOwner && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleOpenCollaborators}
          >
            <Users size={ACTION_ICON_SIZE} />
            Collaborators
          </Button>
        )}
        {shouldShowReviewLink && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleOpenReviewPanel}
          >
            <Upload size={ACTION_ICON_SIZE} />
            Review proposals
          </Button>
        )}
        {isOwner && (
          <>
            <span className="skill-row-expanded-spacer" />
            <Button
              variant="danger-outline"
              size="small"
              onClick={handleRequestDelete}
            >
              <Trash2 size={ACTION_ICON_SIZE} />
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
      {collabLoginDialogState.isOpen && (
        <ConfirmDialog
          title={collabLoginDialogState.title}
          message={collabLoginDialogState.message}
          confirmLabel={collabLoginDialogState.confirmLabel}
          isDangerous={collabLoginDialogState.isDangerous}
          onConfirm={collabLoginDialogState.onConfirm}
          onCancel={closeCollabLoginDialog}
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

function buildCollaborationModeLabel(collaborationMode: Skill['collaborationMode']): string {
  const isOpenMode = collaborationMode === 'open';
  return isOpenMode ? 'Open collaboration' : 'Closed collaboration';
}

