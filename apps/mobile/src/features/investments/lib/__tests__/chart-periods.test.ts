import { BOVA11_SERIES, CDB_110_CDI_SERIES, PETR4_QUOTES } from '../../asset-series';
import {
  formatCdiShare,
  formatChartMoney,
  formatChartTick,
  formatPoints,
  quoteScale,
  quotesForPeriod,
  seriesForPeriod,
  summarize,
} from '../chart-periods';

/** `formatCents` separates "R$" with a no-break space. */
const plain = (text: string) => text.replace(/\u00a0/g, ' ');

describe('chart periods', () => {
  it('keeps the design series for 12 months and has no 5-year data', () => {
    expect(seriesForPeriod(BOVA11_SERIES, '1A', 'money')).toBe(BOVA11_SERIES);
    expect(seriesForPeriod(BOVA11_SERIES, '5A', 'money')).toBeNull();
  });

  it('summarizes the 12-month BOVA11 chart like the design', () => {
    const summary = summarize(BOVA11_SERIES, 'money');
    expect(plain(formatChartMoney(summary.change))).toBe('R$ 13,81');
    expect(formatCdiShare(summary)).toBe('87,6% do CDI');
    expect(formatPoints(summary.assetReturn - summary.cdiReturn)).toBe('−1,75 p.p.');
  });

  it('restarts returns at zero on the first day of a shorter period', () => {
    const month = seriesForPeriod(CDB_110_CDI_SERIES, '1M', 'percent');
    expect(month?.asset[0]).toBe(0);
    expect(month?.asset.length).toBe(17);
    expect(month?.ticks[0]).toBeGreaterThan(month?.ticks[2] ?? 0);
  });

  it('formats ticks', () => {
    expect(plain(formatChartTick(645072, 'money'))).toBe('R$ 645.072');
    expect(plain(formatChartTick(138.14, 'money'))).toBe('R$ 138,14');
    expect(formatChartTick(0, 'percent')).toBe('0%');
    expect(formatChartTick(14, 'percent')).toBe('+14%');
  });

  it('builds the quote grid of the design (31 … 41)', () => {
    expect(quoteScale(PETR4_QUOTES)).toEqual({ min: 31, max: 41, ticks: [31, 33, 35, 37, 39, 41] });
    expect(quotesForPeriod(PETR4_QUOTES, '1M')).toHaveLength(21);
    expect(quotesForPeriod(PETR4_QUOTES, '1D')).toBeNull();
  });
});
