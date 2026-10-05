import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/lib/storage';

/** "Tamanho do texto" in Meu perfil. */
export type TextSize = 'default' | 'large' | 'larger';

/** Font scale applied by `Text` on top of the system setting. */
export const TEXT_SCALE: Record<TextSize, number> = { default: 1, large: 1.12, larger: 1.24 };

export type NoticeKind = 'budgets' | 'priceAlerts' | 'unusualPurchases';
export type NoticeChannel = 'push' | 'email';

interface UiPreferencesState {
  /** Mask monetary values on screen (privacy mode). */
  hideBalances: boolean;
  toggleHideBalances: () => void;
  /** Start every session with values hidden. */
  hideBalancesOnOpen: boolean;
  textSize: TextSize;
  /** Turn off animations regardless of the system setting. */
  reduceMotion: boolean;
  biometrics: boolean;
  /** Channels of each kind of notice ("Notificações"). */
  notices: Record<NoticeKind, Record<NoticeChannel, boolean>>;
  set: (
    patch: Partial<Omit<UiPreferencesState, 'set' | 'toggleHideBalances' | 'toggleNotice'>>,
  ) => void;
  toggleNotice: (kind: NoticeKind, channel: NoticeChannel) => void;
}

export const useUiPreferences = create<UiPreferencesState>()(
  persist(
    (set) => ({
      hideBalances: false,
      toggleHideBalances: () => set((state) => ({ hideBalances: !state.hideBalances })),
      hideBalancesOnOpen: false,
      textSize: 'default',
      reduceMotion: false,
      biometrics: false,
      notices: {
        budgets: { push: false, email: false },
        priceAlerts: { push: false, email: false },
        unusualPurchases: { push: false, email: false },
      },
      set: (patch) => set(patch),
      toggleNotice: (kind, channel) =>
        set((state) => ({
          notices: {
            ...state.notices,
            [kind]: { ...state.notices[kind], [channel]: !state.notices[kind][channel] },
          },
        })),
    }),
    {
      name: 'ui-preferences',
      version: 2,
      storage: createJSONStorage(() => kvStorage),
      // Older versions only had `hideBalances`; the new fields keep their defaults.
      migrate: (persisted) => persisted as UiPreferencesState,
      onRehydrateStorage: () => (state) => {
        if (state?.hideBalancesOnOpen) state.set({ hideBalances: true });
      },
    },
  ),
);
