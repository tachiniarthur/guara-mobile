import type { Entity } from './common';
import type { Cents } from './money';

export type SimulationMode = 'retirement' | 'goal' | 'cut_expense';

export interface SimulationPoint {
  /** Months from today. */
  month: number;
  balance: Cents;
}

export interface Simulation extends Entity {
  mode: SimulationMode;
  name: string;
  /** Mode-specific inputs, validated by the API. */
  inputs: Record<string, unknown>;
  result: SimulationPoint[];
}
