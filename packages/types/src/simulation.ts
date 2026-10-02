/** Financial simulations (run by the Pacu assistant and the simulator screens). */
import { z } from 'zod';

import { CategoryIdSchema } from './category';
import { IsoDateSchema, timestamps } from './common';
import { GoalIdSchema, SimulationIdSchema } from './ids';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { PercentSchema } from './percent';

export const SimulationModeSchema = z.enum(['retirement', 'goal', 'cut_expense']);
export type SimulationMode = z.infer<typeof SimulationModeSchema>;

/** Expected yearly return above inflation, in percentage points (e.g. 4.5). */
const AnnualReturnSchema = PercentSchema.min(-50).max(50);

export const RetirementInputsSchema = z
  .object({
    currentAge: z.int().min(14).max(100),
    retirementAge: z.int().min(30).max(100),
    currentSavings: NonNegativeCentsSchema,
    monthlyContribution: NonNegativeCentsSchema,
    /** Income the user wants to draw per month once retired. */
    desiredMonthlyIncome: PositiveCentsSchema,
    annualReturn: AnnualReturnSchema,
  })
  .refine(({ currentAge, retirementAge }) => retirementAge > currentAge, {
    message: 'retirementAge must be after currentAge',
    path: ['retirementAge'],
  });

export const GoalInputsSchema = z.object({
  targetAmount: PositiveCentsSchema,
  deadline: IsoDateSchema,
  initialAmount: NonNegativeCentsSchema,
  annualReturn: AnnualReturnSchema,
});

export const CutExpenseInputsSchema = z.object({
  /** Category being reduced, when it comes from the user's spending. */
  categoryId: CategoryIdSchema.nullable(),
  monthlyCut: PositiveCentsSchema,
  months: z.int().min(1).max(600),
  annualReturn: AnnualReturnSchema,
});

export type RetirementInputs = z.infer<typeof RetirementInputsSchema>;
export type GoalInputs = z.infer<typeof GoalInputsSchema>;
export type CutExpenseInputs = z.infer<typeof CutExpenseInputsSchema>;

export const ProjectionPointSchema = z.object({
  /** Months from the start (0 = today). */
  month: z.int().nonnegative(),
  date: IsoDateSchema,
  balance: NonNegativeCentsSchema,
  /** Sum of the money put in up to this point. */
  contributed: NonNegativeCentsSchema,
});
export type ProjectionPoint = z.infer<typeof ProjectionPointSchema>;

export const SimulationResultSchema = z.object({
  /** Projected series, one point per month (or per year beyond 10 years). */
  points: z.array(ProjectionPointSchema).min(1),
  finalBalance: NonNegativeCentsSchema,
  totalContributed: NonNegativeCentsSchema,
  /** Monthly contribution needed to reach the target (retirement and goal modes). */
  requiredMonthlyContribution: NonNegativeCentsSchema.nullable(),
  /** Date the target is reached with the given inputs; `null` if never within the horizon. */
  reachedOn: IsoDateSchema.nullable(),
});
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

/** Body of the "run" endpoint — one variant per mode. */
export const RunSimulationBodySchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('retirement'), inputs: RetirementInputsSchema }),
  z.object({ mode: z.literal('goal'), inputs: GoalInputsSchema }),
  z.object({ mode: z.literal('cut_expense'), inputs: CutExpenseInputsSchema }),
]);
export type RunSimulationBody = z.infer<typeof RunSimulationBodySchema>;

const savedFields = {
  id: SimulationIdSchema,
  name: z.string().min(1),
  result: SimulationResultSchema,
  /** Goal created from this simulation, if any. */
  goalId: GoalIdSchema.nullable(),
  ...timestamps,
};

export const SimulationSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('retirement'), inputs: RetirementInputsSchema, ...savedFields }),
  z.object({ mode: z.literal('goal'), inputs: GoalInputsSchema, ...savedFields }),
  z.object({ mode: z.literal('cut_expense'), inputs: CutExpenseInputsSchema, ...savedFields }),
]);
export type Simulation = z.infer<typeof SimulationSchema>;

export const SaveSimulationBodySchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('retirement'),
    name: z.string().min(1).max(80),
    inputs: RetirementInputsSchema,
  }),
  z.object({ mode: z.literal('goal'), name: z.string().min(1).max(80), inputs: GoalInputsSchema }),
  z.object({
    mode: z.literal('cut_expense'),
    name: z.string().min(1).max(80),
    inputs: CutExpenseInputsSchema,
  }),
]);
export type SaveSimulationBody = z.infer<typeof SaveSimulationBodySchema>;

export const ConvertSimulationToGoalBodySchema = z.object({
  /** Defaults to the simulation name. */
  name: z.string().min(1).max(80).optional(),
});
export type ConvertSimulationToGoalBody = z.infer<typeof ConvertSimulationToGoalBodySchema>;
