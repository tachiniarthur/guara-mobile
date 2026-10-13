import { useState } from 'react';
import { Platform } from 'react-native';

import { toast } from '@/components/feedback';
import { signInWithApple, signInWithGoogle } from '@/lib/auth-oauth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/providers';
import type { SessionStatus } from '@/types/navigation';

/** Apple sign-in exists only on iPhone and iPad. */
export const APPLE_AVAILABLE = Platform.OS === 'ios';

/**
 * "Continuar com Google/Apple". Without Supabase (development) it goes straight to `next`, like
 * the simulated session.
 */
export function useSocialSignIn(next: Exclude<SessionStatus, 'loading' | 'signedOut'>) {
  const { setStatus } = useAuth();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  const run = async (provider: 'google' | 'apple') => {
    if (!isSupabaseConfigured()) {
      setStatus(next);
      return;
    }
    setBusy(provider);
    try {
      const result = provider === 'google' ? await signInWithGoogle() : await signInWithApple();
      if (result === 'success') setStatus(next);
    } catch {
      toast.error(
        `Não deu para entrar com ${provider === 'google' ? 'o Google' : 'a Apple'}. Tente de novo.`,
      );
    } finally {
      setBusy(null);
    }
  };

  return { busy, google: () => run('google'), apple: () => run('apple') };
}
