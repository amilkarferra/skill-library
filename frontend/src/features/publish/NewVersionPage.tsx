import { useParams } from 'react-router-dom';
import { VersionForm } from './VersionForm';
import './NewVersionPage.css';

export function NewVersionPage() {
  const { slug } = useParams<{ slug: string }>();
  const skillSlug = slug || '';

  return (
    <div className="new-version-page">
      <div className="new-version-card">
        <h1 className="new-version-title">Upload New Version</h1>
        <p className="new-version-skill-name">{skillSlug}</p>
        <VersionForm slug={skillSlug} />
      </div>
    </div>
  );
}
