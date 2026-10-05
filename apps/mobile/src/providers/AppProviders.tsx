import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReduceMotion, ReducedMotionConfig } from 'react-native-reanimated';

import { ToastViewport } from '@/components/feedback/Toast';
import { useUiPreferences } from '@/stores/ui-preferences';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  const reduceMotion = useUiPreferences((state) => state.reduceMotion);
  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Only overrides the system setting when asked (the testing mock has no ReducedMotionConfig). */}
      {reduceMotion && typeof ReducedMotionConfig === 'function' ? (
        <ReducedMotionConfig mode={ReduceMotion.Always} />
      ) : null}
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <BottomSheetModalProvider>
              {children}
              <ToastViewport />
            </BottomSheetModalProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.DEFAULT },
});
