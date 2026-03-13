import { useParams } from 'react-router-dom';
import { SidebarLayout } from '../../shared/components/SidebarLayout';
import { NavigationSidebar } from '../../shared/components/NavigationSidebar';
import { VersionForm } from './VersionForm';
import './NewVersionPage.css';

export function NewVersionPage() {
  const { slug } = useParams<{ slug: string }>();
  const skillSlug = slug || '';

  return (
    <SidebarLayout sidebar={<NavigationSidebar />}>
      <div className="new-version-page">
        <div className="new-version-badge">New Version</div>
        <h1 className="new-version-title">Upload New Version</h1>
        <p className="new-version-subtitle">
          Provide the version details for <strong>{skillSlug}</strong>
        </p>
        <div className="new-version-card">
          <VersionForm slug={skillSlug} />
        </div>
      </div>
    </SidebarLayout>
  );
}
