import type { Cents, GoalMovement } from '@guara/types';
import { todayISODate } from '@guara/utils';
import { create } from 'zustand';

import { GOALS, type GoalItem } from './data';

interface GoalsState {
  goals: GoalItem[];
  /** Extra deposits made in the app, newest first, by goal id. */
  deposits: Record<string, GoalMovement[]>;
  /** Creates a goal and returns its id. */
  add: (goal: Omit<GoalItem, 'id'>) => string;
  update: (id: string, patch: Partial<GoalItem>) => void;
  setPaused: (id: string, paused: boolean) => void;
  remove: (id: string) => void;
  deposit: (id: string, amount: Cents) => void;
  reset: () => void;
}

/**
 * Goals with what the user changed in the app. Local until the API exists; then each action
 * becomes a mutation (`goals.create`, `goals.update`, `goals.deposit`, `goals.delete`).
 */
export const useGoalsStore = create<GoalsState>()((set) => ({
  goals: GOALS,
  deposits: {},
  add: (goal) => {
    const id = `goal-${Date.now()}`;
    set(({ goals }) => ({ goals: [...goals, { ...goal, id: id as GoalItem['id'] }] }));
    return id;
  },
  update: (id, patch) =>
    set(({ goals }) => ({
      goals: goals.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)),
    })),
  setPaused: (id, paused) =>
    set(({ goals }) => ({
      goals: goals.map((goal) =>
        goal.id === id ? { ...goal, status: paused ? 'paused' : 'active' } : goal,
      ),
    })),
  remove: (id) => set(({ goals }) => ({ goals: goals.filter((goal) => goal.id !== id) })),
  deposit: (id, amount) =>
    set(({ goals, deposits }) => ({
      goals: goals.map((goal) =>
        goal.id === id ? { ...goal, saved: (goal.saved + amount) as Cents } : goal,
      ),
      deposits: {
        ...deposits,
        [id]: [
          { kind: 'deposit', label: 'Depósito extra', date: todayISODate(), amount },
          ...(deposits[id] ?? []),
        ],
      },
    })),
  reset: () => set({ goals: GOALS, deposits: {} }),
}));
