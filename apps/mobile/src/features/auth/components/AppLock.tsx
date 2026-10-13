import { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { useUiPreferences } from '@/stores/ui-preferences';

import { useAppLockStore } from '../lock';
import { UnlockScreen } from '../screens/UnlockScreen';

/**
 * Covers the app with Desbloqueio when "Entrar com biometria" is on: when it opens and after
 * more than a minute in the background.
 */
export function AppLock() {
  const enabled = useUiPreferences((state) => state.biometrics);
  const locked = useAppLockStore((state) => state.locked);

  // Opening the app: lock once the saved preferences are read.
  useEffect(() => {
    const lockIfEnabled = () => {
      if (useUiPreferences.getState().biometrics) useAppLockStore.getState().lock();
    };
    if (useUiPreferences.persist.hasHydrated()) {
      lockIfEnabled();
      return undefined;
    }
    return useUiPreferences.persist.onFinishHydration(lockIfEnabled);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const store = useAppLockStore.getState();
      if (state === 'background') store.wentToBackground(Date.now());
      else if (state === 'active') store.cameBack(Date.now(), enabled);
    });
    return () => subscription.remove();
  }, [enabled]);

  if (!enabled || !locked) return null;
  return (
    <View style={StyleSheet.absoluteFill}>
      <UnlockScreen />
    </View>
  );
}
