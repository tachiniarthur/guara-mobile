type AccessTokenProvider = () => Promise<string | null> | string | null;

let accessTokenProvider: AccessTokenProvider = () => null;

/** Called by AuthProvider so requests carry the current Supabase access token. */
export function setAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await accessTokenProvider();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
