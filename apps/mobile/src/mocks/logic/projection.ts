/**
 * Simulation math of the fake API: monthly compounding in integer cents.
 * Simple on purpose (no taxes, real returns) — the real API owns the official rules.
 */
import type { IsoDate, RunSimulationBodySchema } from '@guara/types';
import { cents, multiplyCents } from '@guara/utils';

import type { z } from 'zod';

import { addMonths, dayIn, monthOf, monthsBetween } from '../clock';

/** Income drawn per year as a share of the capital (the "4% rule": capital = 25 × income). */
const SAFE_WITHDRAWAL_MONTHS = 300;

function monthlyRate(annualPercent: number): number {
  return (1 + annualPercent / 100) ** (1 / 12) - 1;
}

/** Monthly payment that grows `initial` into `target` in `months`. */
function requiredContribution(target: number, initial: number, months: number, rate: number) {
  const growth = (1 + rate) ** months;
  const missing = target - initial * growth;
  if (missing <= 0) return 0;
  const factor = rate === 0 ? months : (growth - 1) / rate;
  return Math.ceil(missing / factor);
}

interface Plan {
  months: number;
  initial: number;
  contribution: number;
  rate: number;
  target: number | null;
}

function project({ months, initial, contribution, rate, target }: Plan, today: IsoDate) {
  const startMonth = monthOf(today);
  const day = Number(today.slice(8, 10));
  const dateAt = (month: number) => dayIn(addMonths(startMonth, month), day);
  // Monthly points up to 10 years, yearly beyond that.
  const step = months > 120 ? 12 : 1;

  let balance = initial;
  let contributed = initial;
  let reachedOn: IsoDate | null = target !== null && initial >= target ? today : null;
  const points = [{ month: 0, date: today, balance, contributed }];
  for (let month = 1; month <= months; month++) {
    balance = multiplyCents(cents(balance), 1 + rate) + contribution;
    contributed += contribution;
    if (reachedOn === null && target !== null && balance >= target) reachedOn = dateAt(month);
    if (month % step === 0 || month === months) {
      points.push({ month, date: dateAt(month), balance, contributed });
    }
  }
  return { points, finalBalance: balance, totalContributed: contributed, reachedOn };
}

/** Accepts the wire shape, so both fixtures and parsed requests can call it. */
export function runSimulation(body: z.input<typeof RunSimulationBodySchema>, today: IsoDate) {
  switch (body.mode) {
    case 'retirement': {
      const { inputs } = body;
      const months = (inputs.retirementAge - inputs.currentAge) * 12;
      const rate = monthlyRate(inputs.annualReturn);
      const target = inputs.desiredMonthlyIncome * SAFE_WITHDRAWAL_MONTHS;
      const result = project(
        {
          months,
          initial: inputs.currentSavings,
          contribution: inputs.monthlyContribution,
          rate,
          target,
        },
        today,
      );
      return {
        ...result,
        requiredMonthlyContribution: requiredContribution(
          target,
          inputs.currentSavings,
          months,
          rate,
        ),
      };
    }
    case 'goal': {
      const { inputs } = body;
      const months = Math.max(1, monthsBetween(monthOf(today), monthOf(inputs.deadline)));
      const rate = monthlyRate(inputs.annualReturn);
      const required = requiredContribution(
        inputs.targetAmount,
        inputs.initialAmount,
        months,
        rate,
      );
      const result = project(
        {
          months,
          initial: inputs.initialAmount,
          contribution: required,
          rate,
          target: inputs.targetAmount,
        },
        today,
      );
      return { ...result, requiredMonthlyContribution: required };
    }
    case 'cut_expense': {
      const { inputs } = body;
      const result = project(
        {
          months: inputs.months,
          initial: 0,
          contribution: inputs.monthlyCut,
          rate: monthlyRate(inputs.annualReturn),
          target: null,
        },
        today,
      );
      return { ...result, requiredMonthlyContribution: null };
    }
  }
}
