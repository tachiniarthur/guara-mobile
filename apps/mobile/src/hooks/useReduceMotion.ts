import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useUiPreferences } from '@/stores/ui-preferences';

/** True when the system or the app ("Reduzir animações") asks for less motion. */
export function useReduceMotion(): boolean {
  const appSetting = useUiPreferences((state) => state.reduceMotion);
  const [system, setSystem] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setSystem(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystem);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return appSetting || system;
}
