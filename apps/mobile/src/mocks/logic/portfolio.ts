import type {
  AssetClass,
  EvolutionRange,
  ExposureCountry,
  InvestorProfileType,
} from '@guara/types';
import { cents, multiplyCents, sharesOf, sumCents } from '@guara/utils';

import { lastDayOf } from '../clock';
import type { MockDb, PositionRecord } from '../db';

import { dividendsThisYear } from './market';
import { today } from './spending';

export const ASSET_CLASSES: AssetClass[] = [
  'fixed_income',
  'equities',
  'real_estate',
  'alternatives',
];

/** Target allocation of each investor profile (percentage points). */
export const ALLOCATION_TARGETS: Record<InvestorProfileType, Record<AssetClass, number>> = {
  conservative: { fixed_income: 70, equities: 15, real_estate: 10, alternatives: 5 },
  moderate: { fixed_income: 50, equities: 30, real_estate: 15, alternatives: 5 },
  aggressive: { fixed_income: 30, equities: 45, real_estate: 15, alternatives: 10 },
};

const valueOf = (position: PositionRecord) => cents(position.currentValue ?? 0);

/** Positions, largest first, with their share of the portfolio (sums to exactly 100). */
export function positionsWithShares(db: MockDb, filter?: AssetClass) {
  const valued = db.positions.filter((position) => position.currentValue !== null);
  const shares = new Map(
    sharesOf(valued.map(valueOf)).map((share, index) => [valued[index]!.id, share]),
  );
  return [...db.positions]
    .filter((position) => !filter || position.class === filter)
    .sort((a, b) => valueOf(b) - valueOf(a) || a.id.localeCompare(b.id))
    .map((position) => ({ ...position, portfolioPercent: shares.get(position.id) ?? null }));
}

export function portfolioTotal(db: MockDb): number {
  return sumCents(db.positions.map(valueOf));
}

export function allocationOf(db: MockDb) {
  const total = portfolioTotal(db);
  const values = ASSET_CLASSES.map((assetClass) =>
    sumCents(db.positions.filter((position) => position.class === assetClass).map(valueOf)),
  );
  const shares = sharesOf(values);
  const profile = db.investorProfile?.type ?? null;
  const targets = profile ? ALLOCATION_TARGETS[profile] : null;

  // Moves below 1% of the portfolio are noise, not a suggestion.
  const tolerance = Math.round(total / 100);
  const rebalance = targets
    ? ASSET_CLASSES.flatMap((assetClass, index) => {
        const difference = multiplyCents(cents(total), targets[assetClass] / 100) - values[index]!;
        if (Math.abs(difference) <= tolerance || total === 0) return [];
        return [
          {
            class: assetClass,
            action: difference > 0 ? ('buy' as const) : ('sell' as const),
            amount: Math.abs(difference),
          },
        ];
      })
    : null;

  return {
    profile,
    total,
    slices: ASSET_CLASSES.map((assetClass, index) => ({
      class: assetClass,
      currentValue: values[index]!,
      currentPercent: shares[index]!,
      targetPercent: targets ? targets[assetClass] : null,
    })),
    rebalance,
  };
}

export function exposureOf(db: MockDb) {
  const countries: (ExposureCountry | null)[] = ['BR', 'abroad', null];
  const values = countries.map((country) =>
    sumCents(db.positions.filter((position) => position.country === country).map(valueOf)),
  );
  const shares = sharesOf(values);
  return {
    items: countries
      .map((country, index) => ({ country, value: values[index]!, percent: shares[index]! }))
      .filter((item) => item.value > 0),
    total: sumCents(values.map(cents)),
  };
}

export function propertyTotals(db: MockDb) {
  const value = sumCents(
    db.properties.map((property) =>
      cents(property.kind === 'real_estate' ? property.declaredValue : (property.fipeValue ?? 0)),
    ),
  );
  const debt = sumCents(db.properties.map((property) => cents(property.outstandingDebt ?? 0)));
  return { value, debt, net: cents(value - debt) };
}

const round2 = (value: number) => Math.round(value * 100) / 100;
const compound = (rates: readonly number[]) =>
  round2((rates.reduce((acc, rate) => acc * (1 + rate / 100), 1) - 1) * 100);

/**
 * Month-end portfolio values derived backwards from today's value, so the last point always
 * matches the positions (even after resolving a duplicate or adding a manual position).
 */
export function evolutionPoints(db: MockDb) {
  const history = db.wealthHistory;
  if (!history) return [];
  const count = history.months.length;
  const values = new Array<number>(count);
  const invested = new Array<number>(count);
  values[count - 1] = portfolioTotal(db);
  invested[count - 1] = sumCents(db.positions.map((p) => cents(p.investedAmount ?? 0)));
  for (let index = count - 1; index > 0; index--) {
    const withoutContribution = values[index]! - history.contributions[index]!;
    values[index - 1] = Math.max(
      0,
      Math.round(withoutContribution / (1 + history.returns[index]! / 100)),
    );
    invested[index - 1] = Math.max(0, invested[index]! - history.contributions[index]!);
  }
  const todayDate = today(db);
  return history.months.map((month, index) => ({
    date: index === count - 1 ? todayDate : lastDayOf(month),
    value: values[index]!,
    invested: invested[index]!,
    monthReturn: history.returns[index]!,
    monthCdi: history.cdi[index]!,
  }));
}

const RANGE_POINTS: Record<EvolutionRange, number> = { '6m': 7, '12m': 13, all: Infinity };

export function evolutionOf(db: MockDb, range: EvolutionRange) {
  const points = evolutionPoints(db);
  const selected = points.slice(-Math.min(RANGE_POINTS[range], points.length));
  return {
    range,
    points: selected.map((point, index) => ({
      date: point.date,
      value: point.value,
      invested: point.invested,
      // Returns accumulate from the first point of the range (which counts as 0%).
      cumulativeReturn: compound(selected.slice(1, index + 1).map((p) => p.monthReturn)),
      cumulativeCdi: compound(selected.slice(1, index + 1).map((p) => p.monthCdi)),
    })),
  };
}

export function wealthOverviewOf(db: MockDb) {
  const hasPositions = db.positions.length > 0;
  const hasProperties = db.properties.length > 0;
  const properties = propertyTotals(db);
  const invested = hasPositions ? portfolioTotal(db) : null;
  const history = db.wealthHistory;
  const todayDate = today(db);

  const windows = (rates: readonly number[] | undefined) => {
    if (!rates || !history) return { month: null, year: null, twelveMonths: null };
    const year = todayDate.slice(0, 4);
    const inYear = history.months.flatMap((month, index) =>
      month.startsWith(year) ? [rates[index]!] : [],
    );
    return {
      month: round2(rates[rates.length - 1]!),
      year: compound(inYear),
      twelveMonths: compound(rates.slice(-12)),
    };
  };

  const contributions = history
    ? sumCents(
        history.months.flatMap((month, index) =>
          month.startsWith(todayDate.slice(0, 4)) ? [cents(history.contributions[index]!)] : [],
        ),
      )
    : null;

  return {
    invested,
    properties: hasProperties ? properties.value : null,
    debts: hasProperties ? properties.debt : null,
    total:
      hasPositions || hasProperties
        ? cents((invested ?? 0) + properties.value - properties.debt)
        : null,
    returns: windows(history?.returns),
    cdi: windows(history?.cdi),
    contributionsThisYear: hasPositions ? contributions : null,
    dividendsThisYear: dividendsThisYear(db, todayDate),
    updatedAt: hasPositions
      ? (db.positions
          .map((position) => position.valueUpdatedAt)
          .filter((value): value is string => value !== null)
          .sort()
          .at(-1) ?? null)
      : null,
  };
}
