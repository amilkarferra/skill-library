import { create } from 'zustand';
import type { NotificationCount } from '../models/NotificationCount';

interface NotificationsStore {
  pendingNotificationCount: number;
  pendingCollaborationRequests: number;
  pendingVersionProposals: number;
  setNotificationCounts: (notificationCount: NotificationCount) => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  pendingNotificationCount: 0,
  pendingCollaborationRequests: 0,
  pendingVersionProposals: 0,
  setNotificationCounts: (notificationCount) =>
    set({
      pendingNotificationCount: notificationCount.totalPending,
      pendingCollaborationRequests: notificationCount.pendingCollaborationRequests,
      pendingVersionProposals: notificationCount.pendingVersionProposals,
    }),
}));
