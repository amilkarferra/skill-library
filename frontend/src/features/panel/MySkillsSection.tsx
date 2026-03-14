import { useEffect, useCallback, useState } from 'react';
import { Upload, UserPlus } from 'lucide-react';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { EmptyState } from '../../shared/components/EmptyState';
import { SectionHeader } from '../../shared/components/SectionHeader';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import { useNotificationsStore } from '../../shared/stores/useNotificationsStore';
import { MySkillRow } from './MySkillRow';
import { PanelTableSkeleton } from './PanelTableSkeleton';
import { ProposedVersionsSection } from './ProposedVersionsSection';
import { RequestsSection } from './RequestsSection';
import { fetchMySkills } from './panel.service';
import { ApiError, del, patch } from '../../shared/services/api.client';
import type { SkillSummary } from '../../shared/models/SkillSummary';

import './MySkillsSection.css';

const SECTION_ICON_SIZE = 13;

export function MySkillsSection() {
  const [skills, setSkills] = useState<SkillSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();
  const { pendingVersionProposals, pendingCollaborationRequests } =
    useNotificationsStore();

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

  const CONFLICT_STATUS_CODE = 409;

  const handleRestore = useCallback(async (skill: SkillSummary) => {
    setRestoreError(null);
    try {
      await patch<void>(`/skills/${skill.name}/restore`);
      updateSkillActiveStatus(skill.id, true);
    } catch (error) {
      const isSlugConflict = error instanceof ApiError && error.statusCode === CONFLICT_STATUS_CODE;
      if (isSlugConflict) {
        setRestoreError(
          `Cannot restore "${skill.displayName}": a skill with this name already exists. Edit the skill name first.`
        );
        return;
      }
      await loadSkills();
    }
  }, [loadSkills, updateSkillActiveStatus]);

  const hasSkills = skills.length > 0;
  const hasLoadError = loadError !== null;
  const hasRestoreError = restoreError !== null;
  const headerSubtitle = buildHeaderSubtitle(skills);
  const isDataReady = !isLoading && !hasLoadError;

  return (
    <div className="my-skills-section">
      <div className="my-skills-header">
        <div className="my-skills-title-group">
          <h2 className="my-skills-title">My Skills</h2>
          {isDataReady && (
            <span className="my-skills-subtitle">{headerSubtitle}</span>
          )}
        </div>
      </div>
      {isLoading && <PanelTableSkeleton />}
      {hasLoadError && (
        <AlertMessage variant="error">{loadError}</AlertMessage>
      )}
      {hasRestoreError && (
        <AlertMessage variant="error">{restoreError}</AlertMessage>
      )}
      {isDataReady && !hasSkills && (
        <EmptyState
          title="No skills yet"
          description="You have not published any skills. Start by publishing your first one."
        />
      )}
      {isDataReady && hasSkills && (
        <>
          <div className="my-skills-table-header">
            <div className="my-skills-col-name">Skill</div>
            <div className="my-skills-col-status">Status</div>
            <div className="my-skills-col-version">Version</div>
            <div className="my-skills-col-stats">Likes / Downloads</div>
            <div className="my-skills-col-collab">Mode</div>
            <div className="my-skills-col-actions">Actions</div>
          </div>
          {skills.map((skill) => (
            <MySkillRow
              key={skill.id}
              skill={skill}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          ))}
        </>
      )}
      <SectionHeader
        icon={<Upload size={SECTION_ICON_SIZE} />}
        title="Proposed Versions"
        count={pendingVersionProposals}
      />
      <ProposedVersionsSection />
      <SectionHeader
        icon={<UserPlus size={SECTION_ICON_SIZE} />}
        title="Collaboration Requests"
        count={pendingCollaborationRequests}
        badgeVariant="default"
      />
      <RequestsSection />
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

function buildHeaderSubtitle(skills: SkillSummary[]): string {
  const totalCount = skills.length;
  const inactiveCount = skills.filter((skill) => !skill.isActive).length;
  const hasInactiveSkills = inactiveCount > 0;

  const totalLabel = `${totalCount} skills`;
  return hasInactiveSkills
    ? `${totalLabel}, ${inactiveCount} inactive`
    : totalLabel;
}
