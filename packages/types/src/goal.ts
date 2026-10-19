/** Savings goals (watched by the Onça assistant). */
import { z } from 'zod';

import { IsoDateSchema, YearMonthSchema, timestamps } from './common';
import { GoalIdSchema, SimulationIdSchema } from './ids';
import { CentsSchema, NonNegativeCentsSchema, PositiveCentsSchema } from './money';

/** `paused`: deposits stopped by the user (the money stays where it is). */
export const GoalStatusSchema = z.enum(['active', 'paused', 'achieved', 'archived']);
export type GoalStatus = z.infer<typeof GoalStatusSchema>;

/**
 * How the goal is doing, decided by the API: `on_track` (deposits keep the forecast),
 * `not_started` (first deposit still ahead), `behind` (deposits missed or late),
 * `above_surplus` (the monthly deposit needs more than is left over each month).
 */
export const GoalPaceSchema = z.enum(['on_track', 'not_started', 'behind', 'above_surplus']);
export type GoalPace = z.infer<typeof GoalPaceSchema>;

/** Where the money of the goal is kept ("Tesouro Selic 2029 · Itaú"). */
export const GoalStorageSchema = z.object({
  label: z.string().min(1),
  /** Estimated net monthly yield in percentage points (0.9 = 0,9% a.m.). */
  monthlyYield: z.number().nonnegative().nullable(),
});
export type GoalStorage = z.infer<typeof GoalStorageSchema>;

/** Icon of the goal card, kebab case like the categories' ("shield-check"). */
export const GoalIconSchema = z.string().regex(/^[a-z0-9-]+$/);

export const GoalSchema = z.object({
  id: GoalIdSchema,
  name: z.string().min(1),
  icon: GoalIconSchema.nullable(),
  /** Short explanation of the amount ("6 meses de custo de vida"). */
  note: z.string().min(1).nullable(),
  target: PositiveCentsSchema,
  /** Amount accumulated so far. */
  saved: NonNegativeCentsSchema,
  deadline: YearMonthSchema.nullable(),
  status: GoalStatusSchema,
  pace: GoalPaceSchema,
  storage: GoalStorageSchema.nullable(),
  monthlyDeposit: PositiveCentsSchema.nullable(),
  /** Day of the month of the deposit (1–28). */
  depositDay: z.int().min(1).max(28).nullable(),
  firstDepositOn: IsoDateSchema.nullable(),
  /** Month the goal is reached at the current pace, with returns; `null` when unknown. */
  projectedCompletion: YearMonthSchema.nullable(),
  /** The Onça follows the goal (warns when the pace drops, celebrates milestones). */
  watched: z.boolean(),
  /** Push reminder on the deposit day. */
  depositReminder: z.boolean(),
  /** Simulation the goal was created from. */
  simulationId: SimulationIdSchema.nullable(),
  ...timestamps,
});
export type Goal = z.infer<typeof GoalSchema>;

export const GoalMovementKindSchema = z.enum(['deposit', 'yield', 'withdrawal']);
export type GoalMovementKind = z.infer<typeof GoalMovementKindSchema>;

export const GoalMovementSchema = z.object({
  kind: GoalMovementKindSchema,
  /** "Depósito mensal", "Resgate · conserto do carro". */
  label: z.string().min(1),
  date: IsoDateSchema,
  /** Signed: withdrawals are negative. */
  amount: CentsSchema,
});
export type GoalMovement = z.infer<typeof GoalMovementSchema>;

export const GoalMilestoneSchema = z.object({
  percent: z.int().min(1).max(100),
  amount: PositiveCentsSchema,
  /** Month it was reached; `null` while ahead. */
  reachedOn: YearMonthSchema.nullable(),
  /** Forecast for the milestones still ahead. */
  expectedOn: YearMonthSchema.nullable(),
});
export type GoalMilestone = z.infer<typeof GoalMilestoneSchema>;

/** Page of a goal: balance month by month, movements and milestones. */
export const GoalDetailSchema = z.object({
  goal: GoalSchema,
  /** Balance at the end of the last months, oldest first. */
  history: z.array(z.object({ month: YearMonthSchema, balance: NonNegativeCentsSchema })),
  /** Newest first. */
  movements: z.array(GoalMovementSchema),
  milestones: z.array(GoalMilestoneSchema),
});
export type GoalDetail = z.infer<typeof GoalDetailSchema>;

export const CreateGoalBodySchema = z.object({
  name: z.string().min(1).max(80),
  icon: GoalIconSchema.nullable().optional(),
  note: z.string().min(1).max(120).nullable().optional(),
  target: PositiveCentsSchema,
  saved: NonNegativeCentsSchema.optional(),
  deadline: YearMonthSchema.nullable(),
  storageLabel: z.string().min(1).nullable().optional(),
  monthlyDeposit: PositiveCentsSchema.nullable().optional(),
  depositDay: z.int().min(1).max(28).nullable().optional(),
  watched: z.boolean().optional(),
  depositReminder: z.boolean().optional(),
});
export type CreateGoalBody = z.infer<typeof CreateGoalBodySchema>;

export const UpdateGoalBodySchema = CreateGoalBodySchema.partial().extend({
  status: z.enum(['active', 'paused']).optional(),
});
export type UpdateGoalBody = z.infer<typeof UpdateGoalBodySchema>;

/** "Depositar agora": an extra deposit outside the monthly plan. */
export const GoalDepositBodySchema = z.object({ amount: PositiveCentsSchema });
export type GoalDepositBody = z.infer<typeof GoalDepositBodySchema>;
