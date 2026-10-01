import type { Entity, ISODateTime } from './common';

export type AuthProvider = 'google' | 'apple' | 'email';

export type PlanTier = 'free' | 'premium';

export interface User extends Entity {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  authProvider: AuthProvider;
  plan: PlanTier;
  onboardingCompletedAt: ISODateTime | null;
}
