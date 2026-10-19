import { z } from 'zod';

import { IsoDateSchema, IsoDateTimeSchema, timestamps } from './common';
import { PlanIdSchema, UserIdSchema } from './ids';

export const AuthProviderSchema = z.enum(['google', 'apple', 'email']);
export type AuthProvider = z.infer<typeof AuthProviderSchema>;

/** Commercial plan. Kept generic: names and limits come from the API. */
export const PlanSchema = z.object({
  id: PlanIdSchema,
  name: z.string().min(1),
  limits: z.object({
    bankConnections: z.int().nonnegative(),
    aiMessagesPerMonth: z.int().nonnegative(),
  }),
});
export type Plan = z.infer<typeof PlanSchema>;

export const PlanUsageSchema = z.object({
  bankConnections: z.int().nonnegative(),
  aiMessagesThisMonth: z.int().nonnegative(),
  /** Last day counted in the current AI usage cycle. */
  cycleEndsOn: IsoDateSchema,
});
export type PlanUsage = z.infer<typeof PlanUsageSchema>;

export const AccountPlanSchema = z.object({ plan: PlanSchema, usage: PlanUsageSchema });
export type AccountPlan = z.infer<typeof AccountPlanSchema>;

export const TextSizeSchema = z.enum(['default', 'large', 'larger']);
export type TextSize = z.infer<typeof TextSizeSchema>;

/**
 * Appearance settings that follow the account across the app and the web ("Aparência e
 * acessibilidade"). Biometrics stays on each device.
 */
export const UserPreferencesSchema = z.object({
  textSize: TextSizeSchema,
  reduceMotion: z.boolean(),
  hideValuesOnOpen: z.boolean(),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const UpdateUserPreferencesBodySchema = UserPreferencesSchema.partial();
export type UpdateUserPreferencesBody = z.infer<typeof UpdateUserPreferencesBodySchema>;

export const UserSchema = z.object({
  id: UserIdSchema,
  email: z.email(),
  name: z.string().min(1).nullable(),
  avatarUrl: z.url().nullable(),
  authProvider: AuthProviderSchema,
  planId: PlanIdSchema,
  onboardingCompletedAt: IsoDateTimeSchema.nullable(),
  ...timestamps,
});
export type User = z.infer<typeof UserSchema>;

export const UpdateProfileBodySchema = z.object({ name: z.string().min(1).max(80) });
export type UpdateProfileBody = z.infer<typeof UpdateProfileBodySchema>;
