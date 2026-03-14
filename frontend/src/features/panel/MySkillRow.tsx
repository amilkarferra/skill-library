import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, History, Users, Ban, RotateCcw, Trash2 } from 'lucide-react';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import { SkillQuickActions } from '../../shared/components/SkillQuickActions';
import type { SkillSummary } from '../../shared/models/SkillSummary';
import styles from './MySkillRow.module.css';

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
    ? styles.row
    : `${styles.row} ${styles.rowInactive}`;

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
      <div>
        <div className={styles.nameBlock}>
          <span className={styles.name}>{skill.displayName}</span>
          <span className={styles.description}>
            {skill.shortDescription}
          </span>
        </div>
      </div>
      <div>
        <StatusBadge isActive={skill.isActive} />
      </div>
      <div>
        <span className={styles.version}>{versionLabel}</span>
      </div>
      <div>
        <SkillQuickActions
          totalLikes={skill.totalLikes}
          totalDownloads={skill.totalDownloads}
          size="small"
        />
      </div>
      <div>
        <CollabModeBadge collaborationMode={skill.collaborationMode} />
      </div>
      <div>
        <div className={styles.actions}>
          {skill.isActive && (
            <>
              <button
                className={styles.action}
                title="Edit"
                onClick={handleEdit}
              >
                <Pencil size={ACTION_ICON_SIZE} />
              </button>
              <button
                className={styles.action}
                title="Versions"
                onClick={handleVersions}
              >
                <History size={ACTION_ICON_SIZE} />
              </button>
              <button
                className={styles.action}
                title="Collaborators"
                onClick={handleCollaborators}
              >
                <Users size={ACTION_ICON_SIZE} />
              </button>
              <button
                className={`${styles.action} ${styles.actionDanger}`}
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
                className={`${styles.action} ${styles.actionRestore}`}
                title="Restore"
                onClick={handleRestore}
              >
                <RotateCcw size={ACTION_ICON_SIZE} />
                Restore
              </button>
              <button
                className={`${styles.action} ${styles.actionDanger}`}
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
