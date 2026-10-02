import type { MockDb, SimulationRecord } from '../db';
import { mockError, notFound } from '../errors';
import { runSimulation } from '../logic/projection';
import { nextId, touch } from '../logic/records';
import { today } from '../logic/spending';

import type { MockHandlers } from './types';

function findSimulation(db: MockDb, id: string) {
  const simulation = db.simulations.find((item) => item.id === id);
  if (!simulation) throw notFound('Simulação não encontrada.');
  return simulation;
}

function findGoal(db: MockDb, id: string) {
  const goal = db.goals.find((item) => item.id === id);
  if (!goal) throw notFound('Meta não encontrada.');
  return goal;
}

const newestFirst = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const planningHandlers = {
  'simulations.run': ({ body }, { db }) => runSimulation(body, today(db)),

  'simulations.list': (_request, { db }) => newestFirst(db.simulations),

  'simulations.get': ({ params }, { db }) => findSimulation(db, params.simulationId),

  'simulations.save': ({ body }, { db }) => {
    const createdAt = touch(db);
    const simulation = {
      ...body,
      id: nextId(db, 'sim'),
      result: runSimulation(body, today(db)),
      goalId: null,
      createdAt,
      updatedAt: createdAt,
    } as SimulationRecord;
    db.simulations.push(simulation);
    return simulation;
  },

  'simulations.delete': ({ params }, { db }) => {
    findSimulation(db, params.simulationId);
    db.simulations = db.simulations.filter((item) => item.id !== params.simulationId);
    for (const goal of db.goals) {
      if (goal.simulationId === params.simulationId) goal.simulationId = null;
    }
    touch(db);
  },

  'simulations.convertToGoal': ({ params, body }, { db }) => {
    const simulation = findSimulation(db, params.simulationId);
    if (simulation.mode !== 'goal') {
      throw mockError('bad_request', 'Só simulações de meta podem virar uma meta.');
    }
    if (simulation.goalId) throw mockError('conflict', 'Esta simulação já virou uma meta.');
    const createdAt = touch(db);
    const goal = {
      id: nextId(db, 'goal'),
      name: body.name ?? simulation.name,
      target: simulation.inputs.targetAmount,
      saved: simulation.inputs.initialAmount,
      deadline: simulation.inputs.deadline,
      status: 'active' as const,
      simulationId: simulation.id,
      createdAt,
      updatedAt: createdAt,
    };
    db.goals.push(goal);
    simulation.goalId = goal.id;
    simulation.updatedAt = createdAt;
    return goal;
  },

  'goals.list': (_request, { db }) =>
    newestFirst(db.goals).sort(
      (a, b) => Number(a.status !== 'active') - Number(b.status !== 'active'),
    ),

  'goals.get': ({ params }, { db }) => findGoal(db, params.goalId),

  'goals.create': ({ body }, { db }) => {
    const createdAt = touch(db);
    const goal = {
      id: nextId(db, 'goal'),
      name: body.name,
      target: body.target,
      saved: body.saved ?? 0,
      deadline: body.deadline,
      status: 'active' as const,
      simulationId: null,
      createdAt,
      updatedAt: createdAt,
    };
    db.goals.push(goal);
    return goal;
  },

  'goals.delete': ({ params }, { db }) => {
    findGoal(db, params.goalId);
    db.goals = db.goals.filter((item) => item.id !== params.goalId);
    for (const simulation of db.simulations) {
      if (simulation.goalId === params.goalId) simulation.goalId = null;
    }
    touch(db);
  },
} satisfies Partial<MockHandlers<MockDb>>;
