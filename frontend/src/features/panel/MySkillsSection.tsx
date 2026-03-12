import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { EmptyState } from '../../shared/components/EmptyState';
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

  const handleToggleActive = useCallback(async (skill: SkillSummary) => {
    const isCurrentlyActive = skill.isActive;
    try {
      if (isCurrentlyActive) {
        await del<void>(`/skills/${skill.name}`);
      } else {
        await patch<void>(`/skills/${skill.name}/restore`);
      }
      setSkills((previous) =>
        previous.map((existingSkill) => {
          const isTargetSkill = existingSkill.id === skill.id;
          if (isTargetSkill) {
            return { ...existingSkill, isActive: !isCurrentlyActive };
          }
          return existingSkill;
        })
      );
    } catch {
      await loadSkills();
    }
  }, [loadSkills]);

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
                <th className="my-skills-th">LIKES</th>
                <th className="my-skills-th">DOWNLOADS</th>
                <th className="my-skills-th">COLLAB MODE</th>
                <th className="my-skills-th">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <MySkillRow
                  key={skill.id}
                  skill={skill}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
