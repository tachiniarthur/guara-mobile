import { HOUSEHOLD, RETIREMENT_MILESTONES, RETIREMENT_PROFILES, START } from '../data';

import {
  futureValue,
  incomeFromWealth,
  monthlyRate,
  monthsToGoal,
  projection,
  requiredDeposit,
  roundToTens,
  wealthForIncome,
} from './finance';
import { compact, reais, signedReais } from './format';

export interface RetirementInput {
  years: number;
  /** Desired monthly income, today's money. */
  income: number;
  /** Real yearly return, percent. */
  rate: number;
  /** Yearly withdrawal, percent. */
  withdrawal: number;
  /** Already invested (portfolio, plus properties when included). */
  start: number;
}

const depositFor = ({ years, income, rate, withdrawal, start }: RetirementInput) =>
  roundToTens(
    requiredDeposit(wealthForIncome(income, withdrawal), start, monthlyRate(rate), years * 12),
  );

/** Everything the retirement tab shows, from the premises. */
export function simulateRetirement(input: RetirementInput) {
  const { years, income, rate, withdrawal, start } = input;
  const months = years * 12;
  const monthly = monthlyRate(rate);
  const goal = wealthForIncome(income, withdrawal);
  const deposit = depositFor(input);
  const points = projection(start, deposit, monthly, months, 12);
  const final = futureValue(start, deposit, monthly, months);
  const contributed = start + deposit * months;
  const retireYear = START.year + years;

  const yearOf = (value: number) => {
    const month = monthsToGoal(value, start, deposit, monthly, months);
    return month === null ? null : START.year + Math.ceil(month / 12);
  };

  const alternative = (title: string, other: number, detail: string) => ({
    title,
    deposit: other,
    detail: `${detail} · ${signedReais(other - deposit)}`,
  });
  const alternatives = [
    alternative(
      'Aposentar 5 anos depois',
      depositFor({ ...input, years: years + 5 }),
      `em ${retireYear + 5}, com ${years + 5} anos de aportes`,
    ),
    alternative(
      `Pedir ${reais(income - 2000)} por mês`,
      depositFor({ ...input, income: income - 2000 }),
      `patrimônio de ${compact(wealthForIncome(income - 2000, withdrawal), 1)}`,
    ),
    alternative(
      'Começar com R$ 20 mil a mais',
      depositFor({ ...input, start: start + 20000 }),
      'usando parte da reserva',
    ),
    alternative(
      `Render ${(rate + 1).toLocaleString('pt-BR')}% ao ano`,
      depositFor({ ...input, rate: rate + 1 }),
      'carteira mais arrojada',
    ),
  ];

  const surplusFinal = futureValue(start, HOUSEHOLD.surplus, monthly, months);

  return {
    goal,
    deposit,
    retireYear,
    incomeShare: (deposit / HOUSEHOLD.income) * 100,
    points,
    final,
    contributed,
    interest: final - contributed,
    profiles: RETIREMENT_PROFILES.map((profile) => ({
      ...profile,
      deposit: depositFor({ ...input, rate: profile.rate }),
    })),
    milestones: [
      ...RETIREMENT_MILESTONES.filter((step) => step.value < goal).map((step) => ({
        ...step,
        year: yearOf(step.value),
      })),
      { value: goal, caption: null, year: retireYear },
    ],
    alternatives,
    budget: {
      surplus: HOUSEHOLD.surplus,
      gap: deposit - HOUSEHOLD.surplus,
      surplusFinal,
      surplusIncome: incomeFromWealth(surplusFinal, withdrawal),
    },
  };
}

export type RetirementResult = ReturnType<typeof simulateRetirement>;
