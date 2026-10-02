import type { IsoDate } from '@guara/types';

import { addDays, instantAt } from '../clock';
import type { GoalRecord, SimulationRecord } from '../db';
import { runSimulation } from '../logic/projection';

export function buildPlanning(today: IsoDate): {
  simulations: SimulationRecord[];
  goals: GoalRecord[];
} {
  const retirementInputs = {
    currentAge: 34,
    retirementAge: 60,
    currentSavings: 9_500_000,
    monthlyContribution: 150_000,
    desiredMonthlyIncome: 800_000,
    annualReturn: 4,
  };
  const tripInputs = {
    targetAmount: 1_200_000,
    deadline: '2027-07-31',
    initialAmount: 350_000,
    annualReturn: 6,
  };
  const savedAt = (daysAgo: number, time: string) => instantAt(addDays(today, -daysAgo), time);

  const simulations: SimulationRecord[] = [
    {
      id: 'sim_retirement',
      mode: 'retirement',
      name: 'Aposentadoria aos 60',
      inputs: retirementInputs,
      result: runSimulation({ mode: 'retirement', inputs: retirementInputs }, today),
      goalId: null,
      createdAt: savedAt(18, '21:40'),
      updatedAt: savedAt(18, '21:40'),
    },
    {
      id: 'sim_trip',
      mode: 'goal',
      name: 'Viagem para o Nordeste',
      inputs: tripInputs,
      result: runSimulation({ mode: 'goal', inputs: tripInputs }, today),
      goalId: 'goal_trip',
      createdAt: savedAt(30, '13:02'),
      updatedAt: savedAt(30, '13:05'),
    },
  ];

  const goals: GoalRecord[] = [
    {
      id: 'goal_emergency',
      name: 'Reserva de emergência',
      target: 3_000_000,
      saved: 1_840_000,
      deadline: '2027-06-30',
      status: 'active',
      simulationId: null,
      createdAt: instantAt('2026-03-15', '09:30'),
      updatedAt: savedAt(5, '08:00'),
    },
    {
      id: 'goal_trip',
      name: 'Viagem para o Nordeste',
      target: tripInputs.targetAmount,
      saved: tripInputs.initialAmount,
      deadline: tripInputs.deadline,
      status: 'active',
      simulationId: 'sim_trip',
      createdAt: savedAt(30, '13:05'),
      updatedAt: savedAt(30, '13:05'),
    },
  ];

  return { simulations, goals };
}
