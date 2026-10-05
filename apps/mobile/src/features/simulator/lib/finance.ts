/**
 * Compound-interest math of the simulator. Amounts are in reais (number) while simulating and
 * become cents only for display; every result is in today's money (real rates).
 */

/** Yearly rate in percent → equivalent monthly rate (4 → 0.3274%). */
export function monthlyRate(yearlyPercent: number): number {
  return (1 + yearlyPercent / 100) ** (1 / 12) - 1;
}

/** Value after `months` with `start` invested and `deposit` at the end of every month. */
export function futureValue(start: number, deposit: number, rate: number, months: number): number {
  const growth = (1 + rate) ** months;
  const annuity = rate === 0 ? months : (growth - 1) / rate;
  return start * growth + deposit * annuity;
}

/** Monthly deposit that reaches `goal` (0 when `start` alone gets there). */
export function requiredDeposit(goal: number, start: number, rate: number, months: number): number {
  if (months <= 0) return Math.max(0, goal - start);
  const growth = (1 + rate) ** months;
  const annuity = rate === 0 ? months : (growth - 1) / rate;
  return Math.max(0, (goal - start * growth) / annuity);
}

/** Months until `goal` is reached (`null` beyond `limit`). */
export function monthsToGoal(
  goal: number,
  start: number,
  deposit: number,
  rate: number,
  limit = 1200,
): number | null {
  for (let month = 0; month <= limit; month += 1) {
    if (futureValue(start, deposit, rate, month) >= goal) return month;
  }
  return null;
}

/** Wealth needed to live off `monthlyIncome` withdrawing `withdrawalPercent` a year. */
export function wealthForIncome(monthlyIncome: number, withdrawalPercent: number): number {
  return (monthlyIncome * 12) / (withdrawalPercent / 100);
}

export function incomeFromWealth(wealth: number, withdrawalPercent: number): number {
  return (wealth * (withdrawalPercent / 100)) / 12;
}

/** Deposits shown rounded to tens ("R$ 5.640"). */
export const roundToTens = (value: number) => Math.round(value / 10) * 10;
/** Goals round up so the plan still gets there ("R$ 1.310"). */
export const ceilToTens = (value: number) => Math.ceil(value / 10) * 10;

export interface ProjectionPoint {
  /** Total with returns. */
  value: number;
  /** Only what was put in. */
  contributed: number;
}

/** One point every `step` months, from today to `months`. */
export function projection(
  start: number,
  deposit: number,
  rate: number,
  months: number,
  step: number,
): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  for (let month = 0; month <= months; month += step) {
    points.push({
      value: futureValue(start, deposit, rate, month),
      contributed: start + deposit * month,
    });
  }
  return points;
}
