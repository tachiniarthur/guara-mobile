import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/lib/storage';

interface UiPreferencesState {
  /** Mask monetary values on screen (privacy mode). */
  hideBalances: boolean;
  toggleHideBalances: () => void;
}

export const useUiPreferences = create<UiPreferencesState>()(
  persist(
    (set) => ({
      hideBalances: false,
      toggleHideBalances: () => set((state) => ({ hideBalances: !state.hideBalances })),
    }),
    {
      name: 'ui-preferences',
      version: 1,
      storage: createJSONStorage(() => kvStorage),
    },
  ),
);
