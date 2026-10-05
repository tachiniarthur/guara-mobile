import type {
  Cents,
  Goal,
  GoalId,
  GoalMilestone,
  GoalMovement,
  IsoDate,
  YearMonth,
} from '@guara/types';
import { cents } from '@guara/utils';

import type { IconName } from '@/components/ui/Icon';

/** "Today" of the design snapshot (balances go up to September 2026). */
export const GOALS_TODAY: IsoDate = '2026-09-23';
export const GOALS_MONTH: YearMonth = '2026-09';

/** Day the salary arrives: deposits are suggested for it. */
export const SALARY_DAY = 5;

/** A goal as the API returns it (timestamps left out until the API exists). */
export interface GoalItem extends Omit<Goal, 'createdAt' | 'updatedAt'> {
  icon: IconName;
  /** Horizon written by the simulation ("2051 · aos 55 anos"); `null` uses the deadline. */
  horizonNote: string | null;
  /** Month the goal was created ("criada em mar/2025"). */
  createdOn: YearMonth;
}

const id = (value: string) => value as GoalId;

export const GOALS: GoalItem[] = [
  {
    id: id('reserva'),
    name: 'Reserva de emergência',
    note: '6 meses de custo de vida',
    icon: 'shieldCheck',
    target: cents(3_000_000),
    saved: cents(1_589_200),
    deadline: null,
    status: 'active',
    pace: 'on_track',
    storage: { label: 'Tesouro Selic 2029 · Itaú', monthlyYield: null },
    monthlyDeposit: cents(99_000),
    depositDay: 5,
    firstDepositOn: null,
    projectedCompletion: '2027-09',
    watched: true,
    depositReminder: true,
    simulationId: null,
    horizonNote: null,
    createdOn: '2025-03',
  },
  {
    id: id('japao'),
    name: 'Viagem para o Japão',
    note: 'Passagens, hospedagem e passeios para 2 pessoas',
    icon: 'target',
    target: cents(3_000_000),
    saved: cents(400_000),
    deadline: '2028-04',
    status: 'active',
    pace: 'not_started',
    storage: { label: 'CDB 110% CDI · Nubank', monthlyYield: 0.9 },
    monthlyDeposit: cents(131_000),
    depositDay: 5,
    firstDepositOn: '2026-10-05',
    projectedCompletion: '2028-04',
    watched: true,
    depositReminder: true,
    simulationId: null,
    horizonNote: null,
    createdOn: '2026-09',
  },
  {
    id: id('aposentadoria'),
    name: 'Aposentadoria',
    note: null,
    icon: 'sparkle',
    target: cents(300_000_000),
    saved: cents(0),
    deadline: null,
    status: 'active',
    pace: 'above_surplus',
    storage: { label: 'Carteira de investimentos', monthlyYield: null },
    monthlyDeposit: cents(564_000),
    depositDay: 5,
    firstDepositOn: null,
    projectedCompletion: null,
    watched: true,
    depositReminder: false,
    simulationId: null,
    horizonNote: '2051 · aos 55 anos',
    createdOn: '2026-09',
  },
];

/** What a goal page shows beyond the goal itself (only the reserve is in the design). */
export interface GoalExtras {
  /** End-of-month balance; the design shows them rounded to hundreds. */
  history: { month: YearMonth; balance: Cents }[];
  movements: GoalMovement[];
  milestones: GoalMilestone[];
  /** Simulation the Onça suggests ("mandar o corte no transporte por app para cá"). */
  suggestion: { amount: Cents; source: string; readyOn: YearMonth; simulation: 'cut' } | null;
}

export const GOAL_EXTRAS: Partial<Record<string, GoalExtras>> = {
  reserva: {
    history: [
      { month: '2026-04', balance: cents(1_160_000) },
      { month: '2026-05', balance: cents(1_270_000) },
      { month: '2026-06', balance: cents(1_260_000) },
      { month: '2026-07', balance: cents(1_380_000) },
      { month: '2026-08', balance: cents(1_490_000) },
      { month: '2026-09', balance: cents(1_589_200) },
    ],
    movements: [
      { kind: 'deposit', label: 'Depósito mensal', date: '2026-09-05', amount: cents(99_000) },
      { kind: 'yield', label: 'Rendimento de agosto', date: '2026-08-31', amount: cents(14_130) },
      { kind: 'deposit', label: 'Depósito mensal', date: '2026-08-05', amount: cents(99_000) },
      { kind: 'yield', label: 'Rendimento de julho', date: '2026-07-31', amount: cents(13_280) },
      { kind: 'deposit', label: 'Depósito mensal', date: '2026-07-05', amount: cents(99_000) },
      {
        kind: 'withdrawal',
        label: 'Resgate · conserto do carro',
        date: '2026-06-20',
        amount: cents(-120_000),
      },
    ],
    milestones: [
      { percent: 25, amount: cents(750_000), reachedOn: '2025-11', expectedOn: null },
      { percent: 50, amount: cents(1_500_000), reachedOn: '2026-09', expectedOn: null },
      { percent: 75, amount: cents(2_250_000), reachedOn: null, expectedOn: '2027-03' },
      { percent: 100, amount: cents(3_000_000), reachedOn: null, expectedOn: '2027-09' },
    ],
    suggestion: {
      amount: cents(31_200),
      source: 'corte no transporte por app',
      readyOn: '2027-07',
      simulation: 'cut',
    },
  },
};

/** Where a new goal can keep its money (the yields come from the simulator premises). */
export const GOAL_STORAGE_OPTIONS = [
  { key: 'cdb', label: 'CDB 110% CDI · Nubank', detail: 'Rende cerca de 0,9% ao mês' },
  { key: 'selic', label: 'Tesouro Selic 2029 · Itaú', detail: 'Usado pela Reserva de emergência' },
  {
    key: 'savings-box',
    label: 'Caixinha do banco',
    detail: 'Resgate na hora, rende um pouco menos',
  },
] as const;

export type GoalStorageKey = (typeof GOAL_STORAGE_OPTIONS)[number]['key'];
