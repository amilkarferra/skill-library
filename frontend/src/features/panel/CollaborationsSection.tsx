import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Upload } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';
import { CollabModeBadge } from '../../shared/components/CollabModeBadge';
import { fetchMyCollaborations } from './panel.service';
import type { SkillSummary } from '../../shared/models/SkillSummary';
import './CollaborationsSection.css';

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

  if (isLoading) {
    return (
      <div className="collaborations-section">
        <p className="collaborations-loading">Loading collaborations...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="collaborations-section">
        <p className="collaborations-error">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="collaborations-section">
      <div className="collaborations-header">
        <h2 className="collaborations-title">Collaborations</h2>
        <Users size={16} className="collaborations-icon" />
      </div>
      {!hasSkills && (
        <EmptyState
          title="No collaborations"
          description="You are not a collaborator on any skills yet."
        />
      )}
      {hasSkills && (
        <div className="collaborations-list">
          {skills.map((skill) => (
            <div key={skill.id} className="collaboration-item">
              <Link to={`/skills/${skill.name}`} className="collaboration-info">
                <span className="collaboration-name">{skill.displayName}</span>
                <span className="collaboration-owner">
                  @{skill.ownerUsername}
                </span>
              </Link>
              <div className="collaboration-meta">
                <CollabModeBadge collaborationMode={skill.collaborationMode} />
                <span className="collaboration-version">
                  {skill.currentVersion ? `v${skill.currentVersion}` : '-'}
                </span>
                <Link
                  to={`/skills/${skill.name}?tab=versions`}
                  className="collaboration-propose-link"
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
