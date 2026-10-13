import { create } from 'zustand';

/** "O bloqueio volta sempre que o app fica mais de 1 minuto em segundo plano." */
export const LOCK_AFTER_MS = 60 * 1000;

interface AppLockState {
  locked: boolean;
  /** When the app went to the background (ms); `null` while in the foreground. */
  backgroundAt: number | null;
  lock: () => void;
  unlock: () => void;
  wentToBackground: (at: number) => void;
  /** Back in the foreground: locks if it stayed away for more than a minute. */
  cameBack: (at: number, enabled: boolean) => void;
}

/** App lock with the face, the fingerprint or the device passcode (Meu perfil › Segurança). */
export const useAppLockStore = create<AppLockState>()((set, get) => ({
  locked: false,
  backgroundAt: null,
  lock: () => set({ locked: true }),
  unlock: () => set({ locked: false }),
  wentToBackground: (at) => set({ backgroundAt: at }),
  cameBack: (at, enabled) => {
    const { backgroundAt } = get();
    set({
      backgroundAt: null,
      ...(enabled && backgroundAt !== null && at - backgroundAt > LOCK_AFTER_MS
        ? { locked: true }
        : null),
    });
  },
}));
