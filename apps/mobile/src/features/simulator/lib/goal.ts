import { RESERVE } from '../data';

import { ceilToTens, futureValue, monthsToGoal, projection, requiredDeposit } from './finance';
import { reais } from './format';

export interface GoalInput {
  cost: number;
  months: number;
  saved: number;
  /** Net monthly yield. */
  rate: number;
}

const depositFor = ({ cost, months, saved, rate }: GoalInput) =>
  ceilToTens(requiredDeposit(cost, saved, rate, months));

/** Everything the goal tab shows, from the premises. */
export function simulateGoal(input: GoalInput, surplus: number, cutSavings: number) {
  const { cost, months, saved, rate } = input;
  const deposit = depositFor(input);
  const final = futureValue(saved, deposit, rate, months);
  const deposits = deposit * months;
  const monthsWith = (start: number, monthly: number) => monthsToGoal(cost, start, monthly, rate);

  return {
    deposit,
    surplusShare: (deposit / surplus) * 100,
    points: projection(saved, deposit, rate, months, 1),
    final,
    composition: { saved, deposits, yield: final - saved - deposits },
    scenarios: [
      { key: 'faster', label: 'Mais rápido', months: months - 6 },
      { key: 'plan', label: 'Seu plano', months },
      { key: 'lighter', label: 'Mais leve', months: months + 6 },
    ]
      .filter((scenario) => scenario.months > 0)
      .map((scenario) => ({
        ...scenario,
        deposit: depositFor({ ...input, months: scenario.months }),
      })),
    milestones: [25, 50, 75, 100].map((percent) => ({
      percent,
      value: (cost * percent) / 100,
      month: monthsToGoal((cost * percent) / 100, saved, deposit, rate),
    })),
    alternatives: [
      { title: `Guardar ${reais(1000)} por mês`, note: null, months: monthsWith(saved, 1000) },
      {
        title: `Guardar ${reais(deposit + cutSavings)} por mês`,
        note: 'somando a economia do corte de app',
        months: monthsWith(saved, deposit + cutSavings),
      },
      {
        title: 'Começar com R$ 8.000',
        note: 'usando parte da reserva',
        months: monthsWith(saved + 4000, deposit),
      },
    ],
    withReserve: deposit + RESERVE.monthly,
  };
}

export type GoalResult = ReturnType<typeof simulateGoal>;
