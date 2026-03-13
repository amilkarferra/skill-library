import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { PanelSidebar } from './PanelSidebar';
import { MySkillsSection } from './MySkillsSection';
import { CollaborationsSection } from './CollaborationsSection';
import { MyLikesSection } from './MyLikesSection';
import { SettingsPage } from '../settings/SettingsPage';
import { SidebarLayout } from '../../shared/components/SidebarLayout';
import './MyPanelPage.css';

export function MyPanelPage() {
  const { section } = useParams<{ section: string }>();
  const activeSection = section || 'skills';

  const sectionContent = useMemo(() => {
    const sectionMap: Record<string, ReactElement> = {
      skills: <MySkillsSection />,
      collaborations: <CollaborationsSection />,
      likes: <MyLikesSection />,
      settings: <SettingsPage />,
    };

    const isKnownSection = activeSection in sectionMap;
    if (isKnownSection) {
      return sectionMap[activeSection];
    }
    return sectionMap['skills'];
  }, [activeSection]);

  return (
    <SidebarLayout sidebar={<PanelSidebar activeSection={activeSection} />}>
      <div className="my-panel-content">
        {sectionContent}
      </div>
    </SidebarLayout>
  );
}
