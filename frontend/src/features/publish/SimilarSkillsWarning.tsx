import type { SimilarSkill } from '../../shared/models/SimilarSkill';
import { AlertMessage } from '../../shared/components/AlertMessage';
import './SimilarSkillsWarning.css';

interface SimilarSkillsWarningProps {
  readonly skills: readonly SimilarSkill[];
}

export function SimilarSkillsWarning({ skills }: SimilarSkillsWarningProps) {
  const hasNoSkills = skills.length === 0;
  if (hasNoSkills) {
    return null;
  }

  return (
    <AlertMessage variant="warning">
      <div className="similar-skills-warning">
        <span className="similar-skills-warning-title">Similar skills already exist:</span>
        <ul className="similar-skills-warning-list">
          {skills.map(renderSimilarSkillItem)}
        </ul>
        <span className="similar-skills-warning-hint">
          You can contribute to an existing skill or continue creating yours.
        </span>
      </div>
    </AlertMessage>
  );
}

function renderSimilarSkillItem(skill: SimilarSkill) {
  const modeLabel = skill.collaborationMode === 'open' ? 'Open' : 'Closed';

  return (
    <li key={skill.name} className="similar-skills-warning-item">
      <a
        href={`/skills/${skill.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="similar-skills-warning-link"
      >
        {skill.displayName}
      </a>
      <span className="similar-skills-warning-meta">
        by @{skill.ownerUsername} ({modeLabel})
      </span>
    </li>
  );
}
