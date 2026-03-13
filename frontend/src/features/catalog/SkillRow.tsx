import { useCallback } from 'react';
import { ChevronRight, ChevronDown, User, Box } from 'lucide-react';
import type { Skill } from '../../shared/models/Skill';
import { SkillInitialTile } from '../../shared/components/SkillInitialTile';
import { SkillQuickActions } from '../../shared/components/SkillQuickActions';
import { RoleBadge } from '../../shared/components/RoleBadge';
import { useSkillActions } from '../../shared/hooks/useSkillActions';
import './SkillRow.css';

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
  } = useSkillActions(skill);

  const handleRowClick = useCallback(() => {
    onToggleExpand(skill.id);
  }, [skill.id, onToggleExpand]);

  const rowClassName = buildRowClassName(isAlternate);
  const hasVersion = !!skill.currentVersion;
  const collaborationModeLabel = buildCollaborationModeLabel(
    skill.collaborationMode
  );

  return (
    <div className={rowClassName} onClick={handleRowClick}>
      <SkillInitialTile displayName={skill.displayName} />
      <div className="skill-row-main">
        <div className="skill-row-header">
          <div className="skill-row-title-group">
            <span className="skill-row-name">{skill.displayName}</span>
            <RoleBadge role={skill.myRole} />
            {hasVersion && (
              <span className="skill-row-version">
                v{skill.currentVersion}
              </span>
            )}
          </div>
          <span className="skill-row-category-label">
            {skill.categoryName}
          </span>
        </div>
        <div className="skill-row-description">{skill.shortDescription}</div>
        <div className="skill-row-footer">
          <span className="skill-row-meta">
            <User size={12} />
            @{skill.ownerUsername}
          </span>
          <span className="skill-row-meta">
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
        onLikeToggle={handleToggleLike}
        onDownload={handleDownload}
        onCommentNavigate={handleNavigateToComments}
      />
      <div className="skill-row-chevron">
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </div>
    </div>
  );
}

function buildRowClassName(isAlternate: boolean): string {
  const base = 'skill-row';
  return isAlternate ? `${base} skill-row--alt` : base;
}

function buildCollaborationModeLabel(
  collaborationMode: Skill['collaborationMode']
): string {
  if (collaborationMode === 'open') {
    return 'Open collaboration';
  }
  return 'Closed collaboration';
}
