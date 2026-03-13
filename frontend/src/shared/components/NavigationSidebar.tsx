import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Box, Download } from 'lucide-react';
import { Button } from './Button';
import './NavigationSidebar.css';

interface NavigationSidebarProps {
  readonly skillContext?: SkillContextData | null;
}

interface SkillContextData {
  readonly ownerUsername: string;
  readonly currentVersion: string | null;
  readonly totalDownloads: number;
  readonly totalLikes: number;
  readonly onDownload?: () => void;
}

const NAVIGATION_ICON_SIZE = 15;
const ACTION_ICON_SIZE = 12;

export function NavigationSidebar({
  skillContext,
}: NavigationSidebarProps) {
  const location = useLocation();
  const isExplorerActive = location.pathname === '/';
  const isMySkillsActive = location.pathname === '/panel/skills';
  const isMyLikesActive = location.pathname === '/panel/likes';
  const hasSkillContext = skillContext !== undefined && skillContext !== null;

  return (
    <nav className="navigation-sidebar">
      <span className="navigation-sidebar-title">Navigate</span>
      <Link
        to="/"
        className={buildItemClassName(isExplorerActive)}
      >
        <Search size={NAVIGATION_ICON_SIZE} className="navigation-sidebar-item-icon" />
        Explorer
      </Link>
      <Link
        to="/panel/skills"
        className={buildItemClassName(isMySkillsActive)}
      >
        <Box size={NAVIGATION_ICON_SIZE} className="navigation-sidebar-item-icon" />
        My Skills
      </Link>
      <Link
        to="/panel/likes"
        className={buildItemClassName(isMyLikesActive)}
      >
        <Heart size={NAVIGATION_ICON_SIZE} className="navigation-sidebar-item-icon" />
        My Likes
      </Link>

      {hasSkillContext && (
        <>
          <div className="navigation-sidebar-divider" />
          <span className="navigation-sidebar-title">This Skill</span>
          <span className="navigation-sidebar-context-label">Owner</span>
          <span className="navigation-sidebar-context-value">
            @{skillContext.ownerUsername}
          </span>
          {skillContext.currentVersion !== null && (
            <>
              <span className="navigation-sidebar-context-label">Version</span>
              <span className="navigation-sidebar-context-value">
                v{skillContext.currentVersion}
              </span>
            </>
          )}
          <span className="navigation-sidebar-context-label">Stats</span>
          <span className="navigation-sidebar-context-value">
            {skillContext.totalDownloads} downloads / {skillContext.totalLikes} likes
          </span>
          {skillContext.onDownload !== undefined && (
            <div className="navigation-sidebar-actions">
              <Button
                variant="primary"
                size="small"
                onClick={skillContext.onDownload}
              >
                <Download size={ACTION_ICON_SIZE} />
                Download
              </Button>
            </div>
          )}
        </>
      )}
    </nav>
  );
}

function buildItemClassName(isActive: boolean): string {
  const base = 'navigation-sidebar-item';
  return isActive ? `${base} navigation-sidebar-item--active` : base;
}
