/**
 * Social sign-in that works in Expo Go (stub — not wired to any screen yet).
 *
 * - Google: Supabase OAuth in the system browser (expo-web-browser + expo-auth-session).
 *   The redirect URI from `getOAuthRedirectUri()` must be added to
 *   Supabase → Authentication → URL Configuration → Redirect URLs.
 *   In Expo Go it looks like `exp://192.168.0.10:8081/--/auth/callback`;
 *   in a build it is `guara://auth/callback`.
 * - Apple (iOS only): expo-apple-authentication + `signInWithIdToken`. In Expo Go the
 *   token audience is `host.exp.Exponent`, which must be listed in Supabase's Apple
 *   provider "Client IDs".
 *
 * TODO(dev-build): replace Google browser OAuth with @react-native-google-signin/google-signin.
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { getSupabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export type SignInResult = 'success' | 'cancelled';

export function getOAuthRedirectUri(): string {
  return makeRedirectUri({ scheme: 'guara', path: 'auth/callback' });
}

export async function signInWithGoogle(): Promise<SignInResult> {
  const supabase = getSupabase();
  const redirectTo = getOAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return 'cancelled';

  const code = new URL(result.url).searchParams.get('code');
  if (!code) throw new Error('OAuth callback did not include an authorization code.');

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
  return 'success';
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  return Platform.OS === 'ios' && AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple(): Promise<SignInResult> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return 'cancelled';
    throw error;
  }

  if (!credential.identityToken) throw new Error('Apple did not return an identity token.');

  const { error } = await getSupabase().auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
  return 'success';
}
