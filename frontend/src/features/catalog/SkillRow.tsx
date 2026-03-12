import { useCallback } from 'react';
import { Heart, Download, MessageSquare, ChevronRight, ChevronDown, User, Box } from 'lucide-react';
import type { Skill } from '../../shared/models/Skill';
import './SkillRow.css';

interface SkillRowProps {
  skill: Skill;
  isExpanded: boolean;
  isAlternate: boolean;
  onToggleExpand: (skillId: number) => void;
}

export function SkillRow({
  skill,
  isExpanded,
  isAlternate,
  onToggleExpand,
}: SkillRowProps) {
  const handleRowClick = useCallback(() => {
    onToggleExpand(skill.id);
  }, [skill.id, onToggleExpand]);

  const rowClassName = buildRowClassName(isAlternate);
  const hasVersion = !!skill.currentVersion;
  const skillInitial = buildSkillInitial(skill.displayName);
  const collaborationModeLabel = buildCollaborationModeLabel(skill.collaborationMode);

  return (
    <div className={rowClassName} onClick={handleRowClick}>
      <div className="skill-row-tile">{skillInitial}</div>
      <div className="skill-row-main">
        <div className="skill-row-header">
          <div className="skill-row-title-group">
            <span className="skill-row-name">{skill.displayName}</span>
            {hasVersion && (
              <span className="skill-row-version">v{skill.currentVersion}</span>
            )}
          </div>
          <span className="skill-row-category-label">{skill.categoryName}</span>
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
      <div className="skill-row-stats">
        <span className="skill-row-stat">
          <span className="skill-row-stat-icon">
            <Heart size={13} />
          </span>
          {skill.totalLikes}
        </span>
        <span className="skill-row-stat">
          <span className="skill-row-stat-icon">
            <Download size={13} />
          </span>
          {skill.totalDownloads}
        </span>
        <span className="skill-row-stat">
          <span className="skill-row-stat-icon">
            <MessageSquare size={13} />
          </span>
          {skill.totalComments}
        </span>
      </div>
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

function buildSkillInitial(displayName: string): string {
  const trimmedDisplayName = displayName.trim();
  const hasDisplayName = trimmedDisplayName.length > 0;
  if (!hasDisplayName) {
    return 'S';
  }

  return trimmedDisplayName.slice(0, 1).toUpperCase();
}

function buildCollaborationModeLabel(collaborationMode: Skill['collaborationMode']): string {
  if (collaborationMode === 'open') {
    return 'Open collaboration';
  }

  return 'Closed collaboration';
}
