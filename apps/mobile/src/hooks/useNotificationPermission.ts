import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { getNotificationPermission, type NotificationPermission } from '@/lib/notifications';

/**
 * Notification permission of this device, checked again whenever the app comes back to the
 * foreground (the user may have turned it on in the settings).
 */
export function useNotificationPermission(): NotificationPermission | null {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  useEffect(() => {
    let active = true;
    const check = () =>
      void getNotificationPermission().then((value) => {
        if (active) setPermission(value);
      });
    check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return permission;
}
