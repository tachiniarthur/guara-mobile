import { create } from 'zustand';

import { MAX_ATTEMPTS } from './lib/code';

export type CodeMode = 'sign-in' | 'sign-up';

interface EmailCodeState {
  /** E-mail the last code went to (kept when going back to change it). */
  email: string;
  mode: CodeMode;
  /** When the current code was sent (ms); `null` before any code. */
  sentAt: number | null;
  attemptsLeft: number;
  setEmail: (email: string) => void;
  /** A new code was sent: the tries start over. */
  codeSent: (email: string, mode: CodeMode) => void;
  /** A wrong code used a try. */
  failedAttempt: () => void;
  reset: () => void;
}

/** The e-mail and code in progress, shared by Boas-vindas, Entrar and the code screen. */
export const useEmailCodeStore = create<EmailCodeState>()((set) => ({
  email: '',
  mode: 'sign-in',
  sentAt: null,
  attemptsLeft: MAX_ATTEMPTS,
  setEmail: (email) => set({ email }),
  codeSent: (email, mode) => set({ email, mode, sentAt: Date.now(), attemptsLeft: MAX_ATTEMPTS }),
  failedAttempt: () => set((state) => ({ attemptsLeft: Math.max(0, state.attemptsLeft - 1) })),
  reset: () => set({ email: '', mode: 'sign-in', sentAt: null, attemptsLeft: MAX_ATTEMPTS }),
}));
