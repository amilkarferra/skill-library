import { Upload } from 'lucide-react';
import { SkillForm } from './SkillForm';
import './PublishSkillPage.css';

export function PublishSkillPage() {
  return (
    <div className="publish-skill-page">
      <div className="publish-skill-card">
        <div className="publish-skill-header">
          <div className="publish-skill-badge">
            <Upload size={18} />
          </div>
          <div className="publish-skill-copy">
            <span className="publish-skill-kicker">Publish</span>
            <h1 className="publish-skill-title">Publish a Skill</h1>
            <p className="publish-skill-subtitle">
              Package your instructions, metadata and file in a single polished entry.
            </p>
          </div>
        </div>
        <SkillForm />
      </div>
    </div>
  );
}
