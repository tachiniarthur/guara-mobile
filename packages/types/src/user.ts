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
