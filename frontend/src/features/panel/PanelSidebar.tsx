import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Box, Users, Heart, Settings } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { useNotificationsStore } from '../../shared/stores/useNotificationsStore';
import { CountBadge } from '../../shared/components/CountBadge';
import { QuickPublishDropzone } from '../../shared/components/QuickPublishDropzone';
import styles from './PanelSidebar.module.css';

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
        ? `${styles.item} ${styles.itemActive}`
        : styles.item;
      const IconComponent = item.icon;
      const itemCount = sidebarCountMap[item.key] ?? 0;
      return (
        <Link key={item.key} to={item.path} className={itemClassName}>
          <span className={styles.itemContent}>
            <IconComponent size={15} className={styles.itemIcon} />
            <span className={styles.itemLabel}>{item.label}</span>
          </span>
          <CountBadge count={itemCount} />
        </Link>
      );
    });
  }, [activeSection, sidebarCountMap]);

  const isSettingsActive = activeSection === SETTINGS_ITEM.key;
  const settingsClassName = isSettingsActive
    ? `${styles.item} ${styles.itemActive} ${styles.itemSeparated}`
    : `${styles.item} ${styles.itemSeparated}`;

  return (
    <div>
      <div className={styles.user}>
        <span className={styles.userName}>{user?.displayName}</span>
        <span className={styles.userHandle}>@{user?.username}</span>
      </div>
      <span className={styles.title}>Workspace</span>
      <nav className={styles.nav}>
        {renderedMainItems}
        <Link to={SETTINGS_ITEM.path} className={settingsClassName}>
          <span className={styles.itemContent}>
            <Settings size={15} className={styles.itemIcon} />
            <span className={styles.itemLabel}>
              {SETTINGS_ITEM.label}
            </span>
          </span>
        </Link>
      </nav>
      <div className={styles.quickPublish}>
        <QuickPublishDropzone />
      </div>
    </div>
  );
}

