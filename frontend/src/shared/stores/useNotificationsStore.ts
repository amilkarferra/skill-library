import { create } from 'zustand';
import type { NotificationCount } from '../models/NotificationCount';

interface NotificationsStore {
  pendingNotificationCount: number;
  pendingCollaborationRequests: number;
  pendingVersionProposals: number;
  mySkillsCount: number;
  collaborationsCount: number;
  likesCount: number;
  setNotificationCounts: (notificationCount: NotificationCount) => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  pendingNotificationCount: 0,
  pendingCollaborationRequests: 0,
  pendingVersionProposals: 0,
  mySkillsCount: 0,
  collaborationsCount: 0,
  likesCount: 0,
  setNotificationCounts: (notificationCount) =>
    set({
      pendingNotificationCount: notificationCount.totalPending,
      pendingCollaborationRequests: notificationCount.pendingCollaborationRequests,
      pendingVersionProposals: notificationCount.pendingVersionProposals,
      mySkillsCount: notificationCount.mySkillsCount,
      collaborationsCount: notificationCount.collaborationsCount,
      likesCount: notificationCount.likesCount,
    }),
}));
