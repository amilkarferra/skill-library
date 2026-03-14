import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Upload } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import { PanelListSkeleton } from './PanelListSkeleton';
import { fetchMyCollaborations } from './panel.service';
import type { SkillSummary } from '../../shared/models/SkillSummary';
import styles from './CollaborationsSection.module.css';

export function CollaborationsSection() {
  const [skills, setSkills] = useState<SkillSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCollaborations = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const collaboratedSkills = await fetchMyCollaborations();
      setSkills(collaboratedSkills);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load collaborations';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollaborations();
  }, [loadCollaborations]);

  const hasSkills = skills.length > 0;
  const hasLoadError = loadError !== null;
  const isDataReady = !isLoading && !hasLoadError;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Collaborations</h2>
        <Users size={16} className={styles.icon} />
      </div>
      {isLoading && <PanelListSkeleton />}
      {hasLoadError && (
        <p className={styles.error}>{loadError}</p>
      )}
      {isDataReady && !hasSkills && (
        <EmptyState
          title="No collaborations"
          description="You are not a collaborator on any skills yet."
        />
      )}
      {isDataReady && hasSkills && (
        <div className={styles.list}>
          {skills.map((skill) => (
            <div key={skill.id} className={styles.item}>
              <Link to={`/skills/${skill.name}`} className={styles.info}>
                <span className={styles.name}>{skill.displayName}</span>
                <span className={styles.owner}>
                  @{skill.ownerUsername}
                </span>
              </Link>
              <div className={styles.meta}>
                <CollabModeBadge collaborationMode={skill.collaborationMode} />
                <span className={styles.version}>
                  {skill.currentVersion ? `v${skill.currentVersion}` : '-'}
                </span>
                <Link
                  to={`/skills/${skill.name}?tab=versions`}
                  className={styles.proposeLink}
                  title="Propose version"
                >
                  <Upload size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
