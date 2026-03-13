import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { EmptyState } from '../../shared/components/EmptyState';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import { MySkillRow } from './MySkillRow';
import { fetchMySkills } from './panel.service';
import { del, patch } from '../../shared/services/api.client';
import type { SkillSummary } from '../../shared/models/SkillSummary';

import './MySkillsSection.css';

const ICON_SIZE_SMALL = 14;

export function MySkillsSection() {
  const [skills, setSkills] = useState<SkillSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();

  const loadSkills = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const ownedSkills = await fetchMySkills();
      setSkills(ownedSkills);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load skills';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const updateSkillActiveStatus = useCallback(
    (skillId: number, isActive: boolean) => {
      setSkills((previous) =>
        previous.map((existingSkill) => {
          const isTargetSkill = existingSkill.id === skillId;
          if (isTargetSkill) return { ...existingSkill, isActive };
          return existingSkill;
        })
      );
    },
    []
  );

  const executeDelete = useCallback(async (skill: SkillSummary) => {
    try {
      await del<void>(`/skills/${skill.name}`);
      closeDialog();
      updateSkillActiveStatus(skill.id, false);
    } catch {
      closeDialog();
      await loadSkills();
    }
  }, [closeDialog, loadSkills, updateSkillActiveStatus]);

  const handleDelete = useCallback((skill: SkillSummary) => {
    openDialog({
      title: 'Delete skill',
      message: `Are you sure you want to delete "${skill.displayName}"? The skill will be deactivated but can be restored later.`,
      confirmLabel: 'Delete',
      isDangerous: true,
      onConfirm: () => { void executeDelete(skill); },
    });
  }, [openDialog, executeDelete]);

  const handleRestore = useCallback(async (skill: SkillSummary) => {
    try {
      await patch<void>(`/skills/${skill.name}/restore`);
      updateSkillActiveStatus(skill.id, true);
    } catch {
      await loadSkills();
    }
  }, [loadSkills, updateSkillActiveStatus]);

  const hasSkills = skills.length > 0;

  if (isLoading) {
    return (
      <div className="my-skills-section">
        <p className="my-skills-loading">Loading skills...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="my-skills-section">
        <AlertMessage variant="error">{loadError}</AlertMessage>
      </div>
    );
  }

  return (
    <div className="my-skills-section">
      <div className="my-skills-header">
        <h2 className="my-skills-title">My Skills</h2>
        <Link to="/publish" className="button button--primary button--small">
          <Plus size={ICON_SIZE_SMALL} />
          Publish New
        </Link>
      </div>
      {!hasSkills && (
        <EmptyState
          title="No skills yet"
          description="You have not published any skills. Start by publishing your first one."
        />
      )}
      {hasSkills && (
        <div className="my-skills-table-wrapper">
          <table className="my-skills-table">
            <thead>
              <tr className="my-skills-table-head">
                <th className="my-skills-th">NAME</th>
                <th className="my-skills-th">STATUS</th>
                <th className="my-skills-th">VERSION</th>
                <th className="my-skills-th my-skills-th--center">LIKES / DOWNLOADS</th>
                <th className="my-skills-th my-skills-th--center">COLLAB MODE</th>
                <th className="my-skills-th">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <MySkillRow
                  key={skill.id}
                  skill={skill}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
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
