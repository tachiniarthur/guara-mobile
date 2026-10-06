import { create } from 'zustand';

import { CURRENT_USER } from '@/constants/current-user';

/** Color of the initials disc ("Cor das iniciais"). */
export type AvatarColor = 'brand' | 'positive' | 'info' | 'negative' | 'sand';

interface UserState {
  name: string;
  email: string;
  /** New e-mail waiting for the confirmation link (login stays on `email`). */
  pendingEmail: string | null;
  avatarColor: AvatarColor;
  /** Local photo chosen in Editar perfil (uploaded by the API later). */
  photoUri: string | null;
  updateProfile: (patch: {
    name?: string;
    avatarColor?: AvatarColor;
    photoUri?: string | null;
  }) => void;
  requestEmailChange: (email: string) => void;
  cancelEmailChange: () => void;
  reset: () => void;
}

const INITIAL = {
  name: CURRENT_USER.name,
  email: CURRENT_USER.email,
  pendingEmail: null,
  avatarColor: 'brand' as AvatarColor,
  photoUri: null,
};

/**
 * The signed-in user as the app shows it. Local until the API exists; then the profile comes
 * from `me.get`, edits from `me.update`, and the e-mail change goes through Supabase Auth
 * (`src/lib`), which sends the confirmation link.
 */
export const useUserStore = create<UserState>()((set) => ({
  ...INITIAL,
  updateProfile: (patch) => set(patch),
  requestEmailChange: (email) => set({ pendingEmail: email }),
  cancelEmailChange: () => set({ pendingEmail: null }),
  reset: () => set(INITIAL),
}));
