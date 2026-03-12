import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Download, Pencil, History, Users, Power } from 'lucide-react';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import type { SkillSummary } from '../../shared/models/SkillSummary';
import './MySkillRow.css';

interface MySkillRowProps {
  readonly skill: SkillSummary;
  readonly onToggleActive: (skill: SkillSummary) => void;
}

export function MySkillRow({ skill, onToggleActive }: MySkillRowProps) {
  const navigate = useNavigate();

  const hasVersion = !!skill.currentVersion;
  const toggleLabel = skill.isActive ? 'Deactivate' : 'Restore';
  const versionLabel = hasVersion ? `v${skill.currentVersion}` : 'No version';

  const handleEdit = useCallback(() => {
    navigate(`/skills/${skill.name}`);
  }, [navigate, skill.name]);

  const handleVersions = useCallback(() => {
    navigate(`/skills/${skill.name}/new-version`);
  }, [navigate, skill.name]);

  const handleCollaborators = useCallback(() => {
    navigate(`/skills/${skill.name}`);
  }, [navigate, skill.name]);

  const handleToggleActive = useCallback(() => {
    onToggleActive(skill);
  }, [onToggleActive, skill]);

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
      <td className="my-skill-row-cell">
        <span className="my-skill-row-stat">
          <Heart size={12} />
          {skill.totalLikes}
        </span>
      </td>
      <td className="my-skill-row-cell">
        <span className="my-skill-row-stat">
          <Download size={12} />
          {skill.totalDownloads}
        </span>
      </td>
      <td className="my-skill-row-cell">
        <CollabModeBadge collaborationMode={skill.collaborationMode} />
      </td>
      <td className="my-skill-row-cell my-skill-row-actions">
        <button className="my-skill-row-action" onClick={handleEdit}>
          <Pencil size={13} />
          <span className="my-skill-row-action-label">Edit</span>
        </button>
        <button className="my-skill-row-action" onClick={handleVersions}>
          <History size={13} />
          <span className="my-skill-row-action-label">Version</span>
        </button>
        <button className="my-skill-row-action" onClick={handleCollaborators}>
          <Users size={13} />
          <span className="my-skill-row-action-label">Collabs</span>
        </button>
        <button
          className="my-skill-row-action my-skill-row-action--toggle"
          onClick={handleToggleActive}
        >
          <Power size={13} />
          <span className="my-skill-row-action-label">{toggleLabel}</span>
        </button>
      </td>
    </tr>
  );
}
