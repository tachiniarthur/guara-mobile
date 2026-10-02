import type { IndicatorWindow, IsoDate, PriceRange } from '@guara/types';
import { addDecimals, cents, multiplyReaisByDecimal, sumCents } from '@guara/utils';

import { addDays } from '../clock';
import type { AssetRecord, MockDb } from '../db';
import { createRandom, seedFrom } from '../random';

const HISTORY_DAYS = 5 * 365 + 1;

/** CDI accumulated over each indicator window (percentage points). */
export const CDI_BY_WINDOW: Record<IndicatorWindow, number> = {
  '1m': 0.92,
  '6m': 5.61,
  '12m': 11.24,
  '60m': 58.4,
};

const cache = new Map<string, number[]>();

/**
 * Daily closes of the last 5 years (oldest first), ending exactly at `lastClose`.
 * Drawn backwards with a seeded random walk, so every range of the same ticker agrees.
 */
export function dailyCloses(ticker: string, lastClose: number, volatility: number): number[] {
  const key = `${ticker}:${lastClose}:${volatility}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const random = createRandom(seedFrom(ticker));
  const dailySigma = volatility / 100 / Math.sqrt(252);
  const closes = [lastClose];
  for (let day = 1; day < HISTORY_DAYS; day++) {
    // Slight upward drift going forward = slight decline going back.
    const shock = (random.next() - 0.5) * 2 * Math.sqrt(3) * dailySigma - 0.0002;
    closes.push(Math.max(1, Math.round(closes[day - 1]! / (1 + shock))));
  }
  closes.reverse();
  cache.set(key, closes);
  return closes;
}

const RANGE_SAMPLING: Record<PriceRange, { days: number; step: number }> = {
  '1m': { days: 30, step: 1 },
  '6m': { days: 182, step: 7 },
  '1y': { days: 364, step: 7 },
  '5y': { days: HISTORY_DAYS - 1, step: 30 },
};

/** Sampled series for a range, oldest first, always ending today. */
export function sampleHistory(asset: AssetRecord, range: PriceRange, today: IsoDate) {
  const closes = closesOf(asset);
  const { days, step } = RANGE_SAMPLING[range];
  const points: { date: IsoDate; value: number }[] = [];
  for (let back = days - (days % step); back >= 0; back -= step) {
    points.push({ date: addDays(today, -back), value: closes[closes.length - 1 - back]! });
  }
  return points;
}

/** Index points are stored ×100 (2 decimals) in the same integer series. */
export function pointsToDecimal(value: number): string {
  return `${Math.trunc(value / 100)}.${String(value % 100).padStart(2, '0')}`;
}

export function lastValueOf(asset: AssetRecord): number {
  const { price, points } = asset.quote;
  if (price !== null) return price;
  if (points === null) throw new Error(`Asset ${asset.quote.ticker} without price or points`);
  const [integer = '0', fraction = ''] = points.split('.');
  return Number(integer) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2));
}

function closesOf(asset: AssetRecord): number[] {
  return dailyCloses(asset.quote.ticker, lastValueOf(asset), asset.volatility);
}

const WINDOW_DAYS: Record<IndicatorWindow, number> = {
  '1m': 30,
  '6m': 182,
  '12m': 365,
  '60m': HISTORY_DAYS - 1,
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export function indicatorsOf(asset: AssetRecord) {
  const closes = closesOf(asset);
  const last = closes[closes.length - 1]!;
  return (Object.keys(WINDOW_DAYS) as IndicatorWindow[]).map((window) => {
    const first = closes[closes.length - 1 - WINDOW_DAYS[window]]!;
    const result = round2(((last - first) / first) * 100);
    const volatility = round2(asset.volatility);
    const cdi = CDI_BY_WINDOW[window];
    return {
      window,
      return: result,
      cdi,
      volatility,
      sharpe: round2((result - cdi) / volatility),
    };
  });
}

/** Year low/high and day change derived from the same series the chart shows. */
export function quoteStats(asset: AssetRecord) {
  const closes = closesOf(asset);
  const year = closes.slice(-365);
  const last = closes[closes.length - 1]!;
  const previous = closes[closes.length - 2]!;
  return {
    yearLow: Math.min(...year),
    yearHigh: Math.max(...year),
    dayChangePercent: round2(((last - previous) / previous) * 100),
  };
}

/** Units of `ticker` across the user's positions (decimal string), or `null`. */
export function quantityHeld(db: MockDb, ticker: string): string | null {
  const quantities = db.positions
    .filter((position) => position.instrument.ticker === ticker && position.quantity !== null)
    .map((position) => position.quantity!);
  return quantities.length ? addDecimals(...quantities) : null;
}

/** Dividends received, using the current quantity held (simplification of the fake world). */
export function userIncomeOf(db: MockDb, asset: AssetRecord, today: IsoDate) {
  const quantity = quantityHeld(db, asset.quote.ticker);
  if (!quantity) return null;
  const yearAgo = addDays(today, -365);
  const payments = asset.dividends
    .filter((dividend) => dividend.paymentDate !== null && dividend.paymentDate <= today)
    .map((dividend) => ({
      paymentDate: dividend.paymentDate!,
      amount: multiplyReaisByDecimal(dividend.amountPerUnit, quantity),
    }))
    .filter((payment) => payment.amount > 0)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  return {
    last12Months: sumCents(payments.filter((p) => p.paymentDate > yearAgo).map((p) => p.amount)),
    allTime: sumCents(payments.map((p) => p.amount)),
    payments,
  };
}

/** Dividends received by the user since January of the current year. */
export function dividendsThisYear(db: MockDb, today: IsoDate): number | null {
  if (db.positions.length === 0) return null;
  const year = today.slice(0, 4);
  return sumCents(
    db.assets.flatMap((asset) =>
      (userIncomeOf(db, asset, today)?.payments ?? [])
        .filter((payment) => payment.paymentDate.startsWith(year))
        .map((payment) => cents(payment.amount)),
    ),
  );
}
