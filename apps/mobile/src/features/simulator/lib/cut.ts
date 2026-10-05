import { RESERVE } from '../data';

import { futureValue, monthlyRate, projection, roundToTens } from './finance';

export interface CutInput {
  /** Average monthly spending in the category (`null`: no history). */
  average: number | null;
  /** Share to cut, 0–100. */
  percent: number;
  /** Real yearly return of the savings, percent. */
  rate: number;
}

/** Everything the cut tab shows, from the premises (`null` without spending history). */
export function simulateCut({ average, percent, rate }: CutInput) {
  if (average === null) return null;
  const savings = Math.round((average * percent) / 100);
  const cap = average - savings;
  const monthly = monthlyRate(rate);
  const after = (years: number) => futureValue(0, savings, monthly, years * 12);

  return {
    savings,
    cap,
    yearly: savings * 12,
    tenYears: after(10),
    points: projection(0, savings, monthly, 120, 12),
    scenarios: [
      { key: 'light', label: 'Corte leve', percent: 30 },
      { key: 'medium', label: 'Corte médio', percent: 50 },
      { key: 'yours', label: 'Seu corte', percent },
    ].map((scenario) => {
      const value = Math.round((average * scenario.percent) / 100);
      return { ...scenario, savings: value, cap: average - value };
    }),
    horizons: [1, 5, 10, 25].map((years) => ({
      years,
      saved: savings * 12 * years,
      value: after(years),
    })),
    /** Cap alerts at half and three quarters of the cap. */
    alerts: [roundToTens(cap / 2), roundToTens(cap * 0.75)],
    reserveMonths: savings > 0 ? Math.round((RESERVE.target - RESERVE.saved) / savings) : null,
  };
}

export type CutResult = NonNullable<ReturnType<typeof simulateCut>>;
