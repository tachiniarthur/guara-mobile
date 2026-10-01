/**
 * Session state (stub). The root layout uses `status` to show (auth), (onboarding) or (app).
 *
 * 🔧 To test each area, change `devSession.status` below and reload the app
 *    ('signedOut' → (auth), 'onboarding' → (onboarding), 'signedIn' → (app)).
 * TODO: restore the Supabase session and derive the status from it.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { SessionStatus } from '@/types/navigation';

export const devSession: { status: Exclude<SessionStatus, 'loading'> } = {
  status: 'signedIn',
};

interface AuthContextValue {
  status: SessionStatus;
  /** Dev helper to switch areas at runtime. */
  setStatus: (status: SessionStatus) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** TODO: read the Supabase session and the onboarding state from the API. */
async function restoreSessionStatus(): Promise<Exclude<SessionStatus, 'loading'>> {
  return devSession.status;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    // Restores the persisted session while the splash screen is visible.
    let active = true;
    restoreSessionStatus().then((restored) => {
      if (active) setStatus(restored);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ status, setStatus }), [status]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
