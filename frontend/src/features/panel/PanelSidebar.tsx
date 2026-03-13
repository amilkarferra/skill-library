import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Box, Users, Heart, GitPullRequest, FileCheck, Settings } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { useNotificationsStore } from '../../shared/stores/useNotificationsStore';
import './PanelSidebar.css';

interface SidebarItem {
  key: string;
  label: string;
  icon: typeof Box;
  path: string;
}

interface PanelSidebarProps {
  activeSection: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'skills', label: 'My Skills', icon: Box, path: '/panel/skills' },
  { key: 'collaborations', label: 'Collaborations', icon: Users, path: '/panel/collaborations' },
  { key: 'likes', label: 'My Likes', icon: Heart, path: '/panel/likes' },
  { key: 'requests', label: 'Requests', icon: GitPullRequest, path: '/panel/requests' },
  { key: 'versions', label: 'Proposed Versions', icon: FileCheck, path: '/panel/versions' },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/panel/settings' },
];

export function PanelSidebar({ activeSection }: PanelSidebarProps) {
  const { user } = useAuthStore();
  const { pendingCollaborationRequests, pendingVersionProposals } = useNotificationsStore();
  const renderedItems = useMemo(() => {
    return SIDEBAR_ITEMS.map((item) => {
      const isActive = item.key === activeSection;
      const itemClass = isActive
        ? 'panel-sidebar-item panel-sidebar-item--active'
        : 'panel-sidebar-item';
      const IconComponent = item.icon;
      const itemCount = buildSidebarItemCount(
        item.key,
        pendingCollaborationRequests,
        pendingVersionProposals
      );
      const hasItemCount = itemCount > 0;
      const badgeClassName = buildSidebarBadgeClass(item.key);

      return (
        <Link key={item.key} to={item.path} className={itemClass}>
          <span className="panel-sidebar-item-content">
            <IconComponent size={15} className="panel-sidebar-item-icon" />
            <span className="panel-sidebar-item-label">{item.label}</span>
          </span>
          {hasItemCount && <span className={badgeClassName}>{itemCount}</span>}
        </Link>
      );
    });
  }, [activeSection, pendingCollaborationRequests, pendingVersionProposals]);

  return (
    <div className="panel-sidebar">
      <div className="panel-sidebar-user">
        <span className="panel-sidebar-user-name">{user?.displayName}</span>
        <span className="panel-sidebar-user-handle">@{user?.username}</span>
      </div>
      <span className="panel-sidebar-title">Workspace</span>
      <nav className="panel-sidebar-nav">
        {renderedItems}
      </nav>
    </div>
  );
}

function buildSidebarItemCount(
  itemKey: string,
  pendingCollaborationRequests: number,
  pendingVersionProposals: number
): number {
  if (itemKey === 'requests') {
    return pendingCollaborationRequests;
  }

  if (itemKey === 'versions') {
    return pendingVersionProposals;
  }

  return 0;
}

function buildSidebarBadgeClass(itemKey: string): string {
  const baseClassName = 'panel-sidebar-count';
  const isWarningCount = itemKey === 'requests' || itemKey === 'versions';
  return isWarningCount ? `${baseClassName} ${baseClassName}--warning` : baseClassName;
}
