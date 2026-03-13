import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, History, Users, Trash2, RotateCcw } from 'lucide-react';
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

export function MySkillRow({ skill, onDelete, onRestore }: MySkillRowProps) {
  const navigate = useNavigate();

  const hasVersion = skill.currentVersion !== null;
  const versionLabel = hasVersion ? `v${skill.currentVersion}` : 'No version';

  const handleEdit = useCallback(() => {
    navigate(`/skills/${skill.name}?edit=true`);
  }, [navigate, skill.name]);

  const handleVersions = useCallback(() => {
    navigate(`/skills/${skill.name}/new-version`);
  }, [navigate, skill.name]);

  const handleCollaborators = useCallback(() => {
    navigate(`/skills/${skill.name}`);
  }, [navigate, skill.name]);

  const handleDelete = useCallback(() => {
    onDelete(skill);
  }, [onDelete, skill]);

  const handleRestore = useCallback(() => {
    onRestore(skill);
  }, [onRestore, skill]);

  return (
    <tr className="my-skill-row">
      <td className="my-skill-row-cell">
        <div className="my-skill-row-name-block">
          <span className="my-skill-row-name">{skill.displayName}</span>
          <span className="my-skill-row-description">{skill.shortDescription}</span>
        </div>
      </td>
      <td className="my-skill-row-cell">
        <StatusBadge isActive={skill.isActive} />
      </td>
      <td className="my-skill-row-cell">
        <span className="my-skill-row-version">{versionLabel}</span>
      </td>
      <td className="my-skill-row-cell my-skill-row-cell--center">
        <SkillQuickActions
          totalLikes={skill.totalLikes}
          totalDownloads={skill.totalDownloads}
          size="small"
        />
      </td>
      <td className="my-skill-row-cell my-skill-row-cell--center">
        <CollabModeBadge collaborationMode={skill.collaborationMode} />
      </td>
      <td className="my-skill-row-cell my-skill-row-actions">
        <button className="my-skill-row-action" title="Edit" onClick={handleEdit}>
          <Pencil size={12} />
        </button>
        <button className="my-skill-row-action" title="Versions" onClick={handleVersions}>
          <History size={12} />
        </button>
        <button className="my-skill-row-action" title="Collaborators" onClick={handleCollaborators}>
          <Users size={12} />
        </button>
        {skill.isActive && (
          <button
            className="my-skill-row-action my-skill-row-action--danger"
            title="Deactivate"
            onClick={handleDelete}
          >
            <Trash2 size={12} />
          </button>
        )}
        {!skill.isActive && (
          <button
            className="my-skill-row-action my-skill-row-action--restore"
            title="Restore"
            onClick={handleRestore}
          >
            <RotateCcw size={12} />
          </button>
        )}
      </td>
    </tr>
  );
}
