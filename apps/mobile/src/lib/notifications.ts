/**
 * Notifications stub.
 *
 * Expo Go supports LOCAL notifications only — remote push was removed from Expo Go
 * (Android, SDK 53+) and needs a development build with an EAS projectId.
 * `expo-notifications` is loaded lazily so merely starting the app in Expo Go
 * does not trigger its warnings.
 */
import * as Device from 'expo-device';
import type * as NotificationsTypes from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { logger } from './logger';
import { isExpoGo } from './runtime';

type NotificationsModule = typeof NotificationsTypes;

// `require` keeps the lazy load and also works in Jest (a dynamic `import()` does not).
const loadNotifications = async (): Promise<NotificationsModule> =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('expo-notifications');

export function isRemotePushAvailable(): boolean {
  return !isExpoGo() && Device.isDevice;
}

/** Foreground presentation + Android channel. Safe to call in Expo Go. */
export async function configureNotifications(): Promise<void> {
  const Notifications = await loadNotifications();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Avisos',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/** `denied`: turned off for the app (only the system settings turn it back on). */
export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermission(): Promise<NotificationPermission> {
  try {
    const Notifications = await loadNotifications();
    const { granted, canAskAgain, status } = await Notifications.getPermissionsAsync();
    if (granted) return 'granted';
    return status === 'denied' && !canAskAgain ? 'denied' : 'undetermined';
  } catch {
    return 'undetermined';
  }
}

/** "Abrir ajustes": the app's page in the system settings. */
export async function openNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = await loadNotifications();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Returns the Expo push token, or `null` where remote push is unavailable.
 * TODO(dev-build): call getExpoPushTokenAsync({ projectId }) and send the token to the API.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!isRemotePushAvailable()) {
    logger.info('Remote push disabled (Expo Go or simulator)');
    return null;
  }
  return null;
}

/** Local notification — works in Expo Go; handy for testing alert copy. */
export async function scheduleLocalNotification(title: string, body: string, seconds = 1) {
  const Notifications = await loadNotifications();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
}
