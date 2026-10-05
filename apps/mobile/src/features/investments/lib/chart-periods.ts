import { cents, formatCents, formatPercent, MINUS_SIGN } from '@guara/utils';

/**
 * Chart periods of the asset page. The design only ships the 12-month series (fund charts) and
 * 6 months of quotes (stocks): shorter periods are cut from them; longer ones are unavailable.
 */

export const FUND_PERIODS = ['1M', 'YTD', '1A', '5A'] as const;
export type FundPeriod = (typeof FUND_PERIODS)[number];

export const QUOTE_PERIODS = ['1D', '1M', '6M', '1A', '5A'] as const;
export type QuotePeriod = (typeof QUOTE_PERIODS)[number];

export type ValueKind = 'money' | 'percent';

export interface ChartSeries {
  asset: readonly number[];
  benchmark: readonly number[];
  ticks: readonly number[];
  /** Y of each tick on the 357×240 canvas. */
  tickYs: readonly number[];
}

/** Grid of the design's price charts: top, middle and bottom ticks, 2.1% beyond the data. */
const PRICE_TICK_YS = [31.2, 111.0, 190.8] as const;
const TICK_PADDING = 0.021;

/** Days before 23/09/2026 covered by the shorter periods (the series spans 365 days). */
const PERIOD_DAYS = { '1M': 31, YTD: 265 } as const;

export const PERIOD_LABELS: Record<Exclude<FundPeriod, '1A' | '5A'>, string> = {
  '1M': '23 AGO 2026 – 23 SET 2026',
  YTD: '1 JAN 2026 – 23 SET 2026',
};

export const PERIOD_X_LABELS: Record<
  Exclude<FundPeriod, '1A' | '5A'>,
  { compact: string[]; wide: string[] }
> = {
  '1M': {
    compact: ['23/08', '02/09', '13/09', '23/09'],
    wide: ['23/08', '28/08', '02/09', '08/09', '13/09', '18/09', '23/09'],
  },
  YTD: {
    compact: ['Jan', 'Mar', 'Mai', 'Jul', 'Set'],
    wide: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
  },
};

/** Series of a period (`null` when the design has no data for it). */
export function seriesForPeriod(
  series: ChartSeries,
  period: FundPeriod,
  kind: ValueKind,
): ChartSeries | null {
  if (period === '1A') return series;
  if (period === '5A') return null;

  const count = Math.round((series.asset.length * PERIOD_DAYS[period]) / 365);
  const from = Math.max(0, series.asset.length - count);
  // Returns restart at 0% on the first day of the period.
  const rebase = (values: readonly number[]) => {
    const start = 1 + (values[from] ?? 0) / 100;
    return values.slice(from).map((value) => ((1 + value / 100) / start - 1) * 100);
  };
  const asset = kind === 'percent' ? rebase(series.asset) : series.asset.slice(from);
  const benchmark = kind === 'percent' ? rebase(series.benchmark) : series.benchmark.slice(from);

  const all = [...asset, ...benchmark];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const padding = (max - min) * TICK_PADDING;
  const top = max + padding;
  const bottom = min - padding;
  return { asset, benchmark, ticks: [top, (top + bottom) / 2, bottom], tickYs: PRICE_TICK_YS };
}

export interface PeriodSummary {
  /** Variation in the chart's unit (reais or percentage points). */
  change: number;
  /** Return of the asset and of the CDI in the period, in percent. */
  assetReturn: number;
  cdiReturn: number;
}

export function summarize({ asset, benchmark }: ChartSeries, kind: ValueKind): PeriodSummary {
  const first = asset[0] ?? 0;
  const last = asset[asset.length - 1] ?? 0;
  const cdiLast = benchmark[benchmark.length - 1] ?? 0;
  if (kind === 'percent') return { change: last - first, assetReturn: last, cdiReturn: cdiLast };
  const cdiFirst = benchmark[0] ?? 1;
  return {
    change: last - first,
    assetReturn: (last / first - 1) * 100,
    cdiReturn: (cdiLast / cdiFirst - 1) * 100,
  };
}

/** Reais (chart unit) → "R$ 125,10"; large prices without cents ("R$ 615.200"). */
export function formatChartMoney(reais: number): string {
  return formatCents(cents(Math.round(reais * 100)), {
    wholeUnits: Math.abs(reais) >= 10_000,
    typographicMinus: true,
  });
}

export function formatChartTick(value: number, kind: ValueKind): string {
  if (kind === 'money') return formatChartMoney(value);
  const digits = Number.isInteger(Math.round(value * 10) / 10) ? 0 : 1;
  return formatPercent(value, {
    fractionDigits: digits,
    signDisplay: 'always',
    typographicMinus: true,
  });
}

/** "−1,75 p.p." */
export function formatPoints(value: number): string {
  const number = Math.abs(value).toFixed(2).replace('.', ',');
  if (Number(number.replace(',', '.')) === 0) return '0,00 p.p.';
  return `${value < 0 ? MINUS_SIGN : '+'}${number} p.p.`;
}

/** "87,6% do CDI" */
export function formatCdiShare({ assetReturn, cdiReturn }: PeriodSummary): string {
  if (cdiReturn === 0) return '—';
  return `${formatPercent((assetReturn / cdiReturn) * 100, { fractionDigits: 1, typographicMinus: true })} do CDI`;
}

/** Stock quotes: the last month of the 6-month series (`null` when unavailable). */
export function quotesForPeriod(
  quotes: readonly number[],
  period: QuotePeriod,
): readonly number[] | null {
  if (period === '6M') return quotes;
  if (period === '1M') return quotes.slice(-21);
  return null;
}

/** Integer grid around the values (step 1 or 2), as in the design (31 … 41). */
export function quoteScale(values: readonly number[]): {
  min: number;
  max: number;
  ticks: number[];
} {
  const min = Math.floor(Math.min(...values)) - 1;
  let max = Math.ceil(Math.max(...values)) + 1;
  const step = max - min > 8 ? 2 : 1;
  if ((max - min) % step !== 0) max += 1;
  const ticks: number[] = [];
  for (let tick = min; tick <= max; tick += step) ticks.push(tick);
  return { min, max, ticks };
}
