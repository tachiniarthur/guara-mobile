/**
 * Signed-in user as shown in the design (static until the API exists). Lives outside the
 * features so any of them can read it without importing Meu perfil.
 */
export const CURRENT_USER = {
  name: 'Arthur',
  initials: 'AR',
  email: 'arthur@exemplo.com',
  banksAllowed: 3,
} as const;
