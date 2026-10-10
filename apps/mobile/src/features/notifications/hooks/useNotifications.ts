import { NOTIFICATIONS } from '../data';
import { useNotificationsStore } from '../store';

/** Notices with their read state, newest first. A TanStack query when the API exists. */
export function useNotifications() {
  const readIds = useNotificationsStore((state) => state.readIds);
  const items = NOTIFICATIONS.map((item) =>
    item.read || !readIds.includes(item.id) ? item : { ...item, read: true },
  );
  return { items, unread: items.filter((item) => !item.read).length };
}
