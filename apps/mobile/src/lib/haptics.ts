/**
 * Haptic feedback for primary actions, centralized so intensity stays consistent and
 * failures (web, devices without a vibration motor) never break the UI.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

function run(effect: () => Promise<void>): void {
  if (!enabled) return;
  effect().catch(() => {
    // Haptics are best-effort.
  });
}

export const haptics = {
  /** Primary button press. */
  impact: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Changing a selection: segmented control, chip, radio, toggle. */
  selection: () => run(() => Haptics.selectionAsync()),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
