import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, History, Users, Ban, RotateCcw, Trash2 } from 'lucide-react';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import { SkillQuickActions } from '../../shared/components/SkillQuickActions';
import type { SkillSummary } from '../../shared/models/SkillSummary';
import './MySkillRow.css';

interface MySkillRowProps {
  readonly skill: SkillSummary;
  readonly onDelete: (skill: SkillSummary) => void;
  readonly onRestore: (skill: SkillSummary) => void;
}

const ACTION_ICON_SIZE = 12;

export function MySkillRow({ skill, onDelete, onRestore }: MySkillRowProps) {
  const navigate = useNavigate();

  const hasVersion = skill.currentVersion !== null;
  const versionLabel = hasVersion ? `v${skill.currentVersion}` : 'No version';
  const rowClassName = skill.isActive
    ? 'my-skill-row'
    : 'my-skill-row my-skill-row--inactive';

  const handleEdit = useCallback(() => {
    navigate(`/skills/${skill.name}?edit=true`);
  }, [navigate, skill.name]);

  const handleVersions = useCallback(() => {
    navigate(`/skills/${skill.name}/new-version`);
  }, [navigate, skill.name]);

  const handleCollaborators = useCallback(() => {
    navigate(`/skills/${skill.name}?tab=collaborators`);
  }, [navigate, skill.name]);

  const handleDelete = useCallback(() => {
    onDelete(skill);
  }, [onDelete, skill]);

  const handleRestore = useCallback(() => {
    onRestore(skill);
  }, [onRestore, skill]);

  return (
    <div className={rowClassName}>
      <div className="my-skills-col-name">
        <div className="my-skill-row-name-block">
          <span className="my-skill-row-name">{skill.displayName}</span>
          <span className="my-skill-row-description">
            {skill.shortDescription}
          </span>
        </div>
      </div>
      <div className="my-skills-col-status">
        <StatusBadge isActive={skill.isActive} />
      </div>
      <div className="my-skills-col-version">
        <span className="my-skill-row-version">{versionLabel}</span>
      </div>
      <div className="my-skills-col-stats">
        <SkillQuickActions
          totalLikes={skill.totalLikes}
          totalDownloads={skill.totalDownloads}
          size="small"
        />
      </div>
      <div className="my-skills-col-collab">
        <CollabModeBadge collaborationMode={skill.collaborationMode} />
      </div>
      <div className="my-skills-col-actions">
        <div className="my-skill-row-actions">
          {skill.isActive && (
            <>
              <button
                className="my-skill-row-action"
                title="Edit"
                onClick={handleEdit}
              >
                <Pencil size={ACTION_ICON_SIZE} />
              </button>
              <button
                className="my-skill-row-action"
                title="Versions"
                onClick={handleVersions}
              >
                <History size={ACTION_ICON_SIZE} />
              </button>
              <button
                className="my-skill-row-action"
                title="Collaborators"
                onClick={handleCollaborators}
              >
                <Users size={ACTION_ICON_SIZE} />
              </button>
              <button
                className="my-skill-row-action my-skill-row-action--danger"
                title="Deactivate"
                onClick={handleDelete}
              >
                <Ban size={ACTION_ICON_SIZE} />
              </button>
            </>
          )}
          {!skill.isActive && (
            <>
              <button
                className="my-skill-row-action my-skill-row-action--restore"
                title="Restore"
                onClick={handleRestore}
              >
                <RotateCcw size={ACTION_ICON_SIZE} />
                Restore
              </button>
              <button
                className="my-skill-row-action my-skill-row-action--danger"
                title="Delete permanently"
                onClick={handleDelete}
              >
                <Trash2 size={ACTION_ICON_SIZE} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
