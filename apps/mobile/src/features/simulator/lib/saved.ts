import { formatDate } from '@guara/utils';

import {
  CUT_CATEGORIES,
  GOAL_PLACES,
  START,
  type SavedSimulation,
  type SimulationKind,
} from '../data';

import { simulateCut } from './cut';
import { reais, longMonth, thousands } from './format';
import { simulateGoal } from './goal';
import { simulateRetirement } from './retirement';

export type SimulationFilter = 'all' | SimulationKind;

export interface SavedSummary {
  /** Highlighted amount ("R$ 5.640/mês"); null when it cannot be computed. */
  amount: string | null;
  detail: string;
}

/** Monthly deposit (or saving) of a saved simulation, in reais; null without history. */
export function monthlyAmount(simulation: SavedSimulation): number | null {
  const { input } = simulation;
  switch (input.kind) {
    case 'retirement':
      return simulateRetirement(input).deposit;
    case 'goal': {
      const rate = GOAL_PLACES.find((place) => place.key === input.place)!.monthlyRate;
      // Surplus and cut savings only change shares the list does not show.
      return simulateGoal({ ...input, rate }, 1, 0).deposit;
    }
    case 'cut': {
      const average = CUT_CATEGORIES.find((item) => item.key === input.category)!.average;
      return simulateCut({ average, percent: input.percent, rate: input.rate })?.savings ?? null;
    }
  }
}

/**
 * Line under the name: "R$ 5.640/mês · para R$ 10.000 de renda em 2051". A retirement with the
 * same income as an earlier one in the list reads "mesma renda, 5 anos depois".
 */
export function savedSummary(
  simulation: SavedSimulation,
  all: readonly SavedSimulation[],
): SavedSummary {
  const monthly = monthlyAmount(simulation);
  const amount = monthly === null ? null : `${reais(monthly)}/mês`;
  const { input } = simulation;

  switch (input.kind) {
    case 'retirement': {
      const base = all.find(
        (other) =>
          other.id !== simulation.id &&
          other.input.kind === 'retirement' &&
          other.input.income === input.income &&
          other.input.years < input.years,
      );
      if (base && base.input.kind === 'retirement') {
        return { amount, detail: `mesma renda, ${input.years - base.input.years} anos depois` };
      }
      return {
        amount,
        detail: `para ${reais(input.income)} de renda em ${START.year + input.years}`,
      };
    }
    case 'goal':
      return { amount, detail: `${reais(input.cost)} em ${longMonth(START, input.months)}` };
    case 'cut': {
      const result = simulateCut({
        average: CUT_CATEGORIES.find((item) => item.key === input.category)!.average,
        percent: input.percent,
        rate: input.rate,
      });
      return {
        amount,
        detail: result ? `${thousands(result.tenYears)} em 10 anos` : 'sem histórico de gastos',
      };
    }
  }
}

/** "Salva em 23/09/2026 · virou meta". */
export function savedCaption(simulation: SavedSimulation): string {
  const date = `Salva em ${formatDate(simulation.savedOn, 'dd/MM/yyyy')}`;
  return simulation.goalId ? `${date} · virou meta` : date;
}

export function filterSimulations(
  simulations: readonly SavedSimulation[],
  filter: SimulationFilter,
): SavedSimulation[] {
  return filter === 'all'
    ? [...simulations]
    : simulations.filter((simulation) => simulation.input.kind === filter);
}

/** "1 simulação" / "4 simulações". */
export function simulationsCountText(count: number): string {
  return count === 1 ? '1 simulação' : `${count} simulações`;
}
