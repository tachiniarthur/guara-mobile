import { z } from 'zod';

import {
  ConvertSimulationToGoalBodySchema,
  CreateGoalBodySchema,
  GoalDepositBodySchema,
  GoalDetailSchema,
  GoalIdSchema,
  GoalSchema,
  RunSimulationBodySchema,
  SaveSimulationBodySchema,
  SimulationIdSchema,
  SimulationResultSchema,
  SimulationSchema,
  UpdateGoalBodySchema,
} from '../../domain';
import { NoContentSchema, defineEndpoints } from '../define';

const simulationParams = z.object({ simulationId: SimulationIdSchema });
const goalParams = z.object({ goalId: GoalIdSchema });

/** Simulations and goals. */
export const planningEndpoints = defineEndpoints({
  'simulations.run': {
    method: 'POST',
    path: '/v1/simulations/run',
    summary: 'Compute a projection without saving it',
    body: RunSimulationBodySchema,
    response: SimulationResultSchema,
  },
  'simulations.list': {
    method: 'GET',
    path: '/v1/simulations',
    summary: 'Saved simulations, newest first',
    response: z.array(SimulationSchema),
  },
  'simulations.get': {
    method: 'GET',
    path: '/v1/simulations/:simulationId',
    summary: 'One saved simulation',
    params: simulationParams,
    response: SimulationSchema,
  },
  'simulations.save': {
    method: 'POST',
    path: '/v1/simulations',
    summary: 'Save a simulation (the API recomputes the result)',
    body: SaveSimulationBodySchema,
    response: SimulationSchema,
  },
  'simulations.delete': {
    method: 'DELETE',
    path: '/v1/simulations/:simulationId',
    summary: 'Delete a saved simulation',
    params: simulationParams,
    response: NoContentSchema,
  },
  'simulations.convertToGoal': {
    method: 'POST',
    path: '/v1/simulations/:simulationId/goal',
    summary: 'Create a goal from a goal-mode simulation',
    params: simulationParams,
    body: ConvertSimulationToGoalBodySchema,
    response: GoalSchema,
  },
  'goals.list': {
    method: 'GET',
    path: '/v1/goals',
    summary: 'Goals, active first',
    response: z.array(GoalSchema),
  },
  'goals.get': {
    method: 'GET',
    path: '/v1/goals/:goalId',
    summary: 'One goal with its history, movements and milestones',
    params: goalParams,
    response: GoalDetailSchema,
  },
  'goals.create': {
    method: 'POST',
    path: '/v1/goals',
    summary: 'Create a goal',
    body: CreateGoalBodySchema,
    response: GoalSchema,
  },
  'goals.update': {
    method: 'PATCH',
    path: '/v1/goals/:goalId',
    summary: 'Edit a goal or pause/resume it',
    params: goalParams,
    body: UpdateGoalBodySchema,
    response: GoalSchema,
  },
  'goals.deposit': {
    method: 'POST',
    path: '/v1/goals/:goalId/deposits',
    summary: 'Register an extra deposit',
    params: goalParams,
    body: GoalDepositBodySchema,
    response: GoalSchema,
  },
  'goals.delete': {
    method: 'DELETE',
    path: '/v1/goals/:goalId',
    summary: 'Delete a goal',
    params: goalParams,
    response: NoContentSchema,
  },
});
