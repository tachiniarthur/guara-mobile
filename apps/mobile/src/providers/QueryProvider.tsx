import { focusManager, onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { addNetworkStateListener } from 'expo-network';
import { useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { createQueryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    // Refetch stale queries when the app returns to the foreground.
    const appState = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    // Pause queries/mutations while offline and resume when back online.
    onlineManager.setEventListener((setOnline) => {
      const network = addNetworkStateListener(({ isConnected }) =>
        setOnline(isConnected !== false),
      );
      return () => network.remove();
    });
    return () => appState.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
