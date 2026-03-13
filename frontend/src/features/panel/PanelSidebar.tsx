import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Box, Users, Heart, Settings } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { useNotificationsStore } from '../../shared/stores/useNotificationsStore';
import { CountBadge } from '../../shared/components/CountBadge';
import './PanelSidebar.css';

interface SidebarItem {
  readonly key: string;
  readonly label: string;
  readonly icon: typeof Box;
  readonly path: string;
}

interface PanelSidebarProps {
  readonly activeSection: string;
}

interface SidebarItemCountMap {
  readonly [key: string]: number;
}

const MAIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'skills', label: 'My Skills', icon: Box, path: '/panel/skills' },
  { key: 'collaborations', label: 'Collaborations', icon: Users, path: '/panel/collaborations' },
  { key: 'likes', label: 'My Likes', icon: Heart, path: '/panel/likes' },
];

const SETTINGS_ITEM: SidebarItem = {
  key: 'settings', label: 'Settings', icon: Settings, path: '/panel/settings',
};

export function PanelSidebar({ activeSection }: PanelSidebarProps) {
  const { user } = useAuthStore();
  const notificationStore = useNotificationsStore();

  const sidebarCountMap = useMemo<SidebarItemCountMap>(() => ({
    skills: notificationStore.mySkillsCount,
    collaborations: notificationStore.collaborationsCount,
    likes: notificationStore.likesCount,
  }), [
    notificationStore.mySkillsCount,
    notificationStore.collaborationsCount,
    notificationStore.likesCount,
  ]);

  const renderedMainItems = useMemo(() => {
    return MAIN_SIDEBAR_ITEMS.map((item) => {
      const isActive = item.key === activeSection;
      const itemClassName = isActive
        ? 'panel-sidebar-item panel-sidebar-item--active'
        : 'panel-sidebar-item';
      const IconComponent = item.icon;
      const itemCount = sidebarCountMap[item.key] ?? 0;
      return (
        <Link key={item.key} to={item.path} className={itemClassName}>
          <span className="panel-sidebar-item-content">
            <IconComponent size={15} className="panel-sidebar-item-icon" />
            <span className="panel-sidebar-item-label">{item.label}</span>
          </span>
          <CountBadge count={itemCount} />
        </Link>
      );
    });
  }, [activeSection, sidebarCountMap]);

  const isSettingsActive = activeSection === SETTINGS_ITEM.key;
  const settingsClassName = isSettingsActive
    ? 'panel-sidebar-item panel-sidebar-item--active panel-sidebar-item--separated'
    : 'panel-sidebar-item panel-sidebar-item--separated';

  return (
    <div className="panel-sidebar">
      <div className="panel-sidebar-user">
        <span className="panel-sidebar-user-name">{user?.displayName}</span>
        <span className="panel-sidebar-user-handle">@{user?.username}</span>
      </div>
      <span className="panel-sidebar-title">Workspace</span>
      <nav className="panel-sidebar-nav">
        {renderedMainItems}
        <Link to={SETTINGS_ITEM.path} className={settingsClassName}>
          <span className="panel-sidebar-item-content">
            <Settings size={15} className="panel-sidebar-item-icon" />
            <span className="panel-sidebar-item-label">
              {SETTINGS_ITEM.label}
            </span>
          </span>
        </Link>
      </nav>
    </div>
  );
}

