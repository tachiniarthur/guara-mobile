import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ToastViewport } from '@/components/feedback/Toast';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={styles.root}>
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
