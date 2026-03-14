import { useCallback } from 'react';
import { ChevronRight, ChevronDown, User, Box } from 'lucide-react';
import type { Skill } from '../../shared/models/Skill';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { SkillInitialTile } from '../../shared/components/SkillInitialTile';
import { SkillQuickActions } from '../../shared/components/SkillQuickActions';
import { RoleBadge } from '../../shared/components/RoleBadge';
import { useSkillActions } from '../../shared/hooks/useSkillActions';
import styles from './SkillRow.module.css';

interface SkillRowProps {
  readonly skill: Skill;
  readonly isExpanded: boolean;
  readonly isAlternate: boolean;
  readonly onToggleExpand: (skillId: number) => void;
}

export function SkillRow({
  skill,
  isExpanded,
  isAlternate,
  onToggleExpand,
}: SkillRowProps) {
  const {
    handleToggleLike,
    handleDownload,
    handleNavigateToComments,
    isLikeInProgress,
    isDownloadInProgress,
    loginDialogState,
    closeLoginDialog,
  } = useSkillActions(skill);

  const handleRowClick = useCallback(() => {
    onToggleExpand(skill.id);
  }, [skill.id, onToggleExpand]);

  const rowClassName = buildRowClassName(isAlternate, styles);
  const hasVersion = !!skill.currentVersion;
  const collaborationModeLabel = buildCollaborationModeLabel(
    skill.collaborationMode
  );

  return (
    <div className={rowClassName} onClick={handleRowClick}>
      <SkillInitialTile displayName={skill.displayName} />
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.name}>{skill.displayName}</span>
            <RoleBadge role={skill.myRole} />
            {hasVersion && (
              <span className={styles.version}>
                v{skill.currentVersion}
              </span>
            )}
          </div>
          <span className={styles.categoryLabel}>
            {skill.categoryName}
          </span>
        </div>
        <div className={styles.description}>{skill.shortDescription}</div>
        <div className={styles.footer}>
          <span className={styles.meta}>
            <User size={12} />
            @{skill.ownerUsername}
          </span>
          <span className={styles.meta}>
            <Box size={12} />
            {collaborationModeLabel}
          </span>
        </div>
      </div>
      <SkillQuickActions
        totalLikes={skill.totalLikes}
        totalDownloads={skill.totalDownloads}
        totalComments={skill.totalComments}
        isLiked={skill.isLikedByMe}
        isLikeLoading={isLikeInProgress}
        isDownloadLoading={isDownloadInProgress}
        onLikeToggle={handleToggleLike}
        onDownload={handleDownload}
        onCommentNavigate={handleNavigateToComments}
      />
      <div className={styles.chevron}>
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </div>

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
    </div>
  );
}

function buildRowClassName(
  isAlternate: boolean,
  styles: Record<string, string>
): string {
  const base = styles.row;
  return isAlternate ? `${base} ${styles.alt}` : base;
}

function buildCollaborationModeLabel(
  collaborationMode: Skill['collaborationMode']
): string {
  if (collaborationMode === 'open') {
    return 'Open collaboration';
  }
  return 'Closed collaboration';
}
