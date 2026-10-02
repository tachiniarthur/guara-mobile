/** Savings goals (watched by the Onça assistant). */
import { z } from 'zod';

import { IsoDateSchema, timestamps } from './common';
import { GoalIdSchema, SimulationIdSchema } from './ids';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';

export const GoalStatusSchema = z.enum(['active', 'achieved', 'archived']);
export type GoalStatus = z.infer<typeof GoalStatusSchema>;

export const GoalSchema = z.object({
  id: GoalIdSchema,
  name: z.string().min(1),
  target: PositiveCentsSchema,
  /** Amount accumulated so far. */
  saved: NonNegativeCentsSchema,
  deadline: IsoDateSchema.nullable(),
  status: GoalStatusSchema,
  /** Simulation the goal was created from. */
  simulationId: SimulationIdSchema.nullable(),
  ...timestamps,
});
export type Goal = z.infer<typeof GoalSchema>;

export const CreateGoalBodySchema = z.object({
  name: z.string().min(1).max(80),
  target: PositiveCentsSchema,
  saved: NonNegativeCentsSchema.optional(),
  deadline: IsoDateSchema.nullable(),
});
export type CreateGoalBody = z.infer<typeof CreateGoalBodySchema>;
