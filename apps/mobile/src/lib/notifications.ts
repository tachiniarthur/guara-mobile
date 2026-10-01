/**
 * Notifications stub.
 *
 * Expo Go supports LOCAL notifications only — remote push was removed from Expo Go
 * (Android, SDK 53+) and needs a development build with an EAS projectId.
 * `expo-notifications` is loaded lazily so merely starting the app in Expo Go
 * does not trigger its warnings.
 */
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { logger } from './logger';
import { isExpoGo } from './runtime';

const loadNotifications = () => import('expo-notifications');

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
