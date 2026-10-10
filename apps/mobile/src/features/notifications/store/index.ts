import { create } from 'zustand';

import { NOTIFICATIONS } from '../data';

interface NotificationsState {
  /** Ids marked as read in the app (the API's `notifications.markRead`). */
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  reset: () => void;
}

/** Read state of the notification center. Local until the API exists. */
export const useNotificationsStore = create<NotificationsState>()((set) => ({
  readIds: [],
  markRead: (id) =>
    set(({ readIds }) => (readIds.includes(id) ? {} : { readIds: [...readIds, id] })),
  markAllRead: () => set({ readIds: NOTIFICATIONS.map((item) => item.id) }),
  reset: () => set({ readIds: [] }),
}));
