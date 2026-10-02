/**
 * Market data. B3 tickers and company names are public market data, so they are real;
 * prices, series and amounts are fictional.
 */
import type { AssetType, DividendType, IsoDate } from '@guara/types';

import { addDays, addMonths, dayIn, monthOf } from '../clock';
import type { AssetRecord } from '../db';
import { quoteStats } from '../logic/market';

interface AssetDef {
  ticker: string;
  name: string;
  type: AssetType;
  /** Cents (or points × 100 for indexes). */
  last: number;
  volatility: number;
  /** Quarterly (stocks) or monthly (FIIs) amount per unit in reais. */
  dividend?: { amountPerUnit: string; monthly?: boolean; jcpEveryOther?: boolean };
  earnings?: { revenue: number; netIncome: number; ebitda: number | null; roe: number };
  events?: AssetRecord['events'];
}

const ASSETS: AssetDef[] = [
  {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    type: 'stock',
    last: 3_842,
    volatility: 31,
    dividend: { amountPerUnit: '0.452318' },
    earnings: {
      revenue: 12_100_000_000_000,
      netIncome: 2_670_000_000_000,
      ebitda: 5_480_000_000_000,
      roe: 21.4,
    },
  },
  {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco PN',
    type: 'stock',
    last: 3_415,
    volatility: 22,
    dividend: { amountPerUnit: '0.210140', jcpEveryOther: true },
    earnings: { revenue: 4_210_000_000_000, netIncome: 1_120_000_000_000, ebitda: null, roe: 22.1 },
    events: [{ type: 'bonus', date: '2025-03-27', description: 'Bonificação de 10% em ações.' }],
  },
  {
    ticker: 'WEGE3',
    name: 'WEG ON',
    type: 'stock',
    last: 4_120,
    volatility: 27,
    dividend: { amountPerUnit: '0.128765', jcpEveryOther: true },
    earnings: {
      revenue: 1_050_000_000_000,
      netIncome: 170_000_000_000,
      ebitda: 230_000_000_000,
      roe: 31.8,
    },
  },
  {
    ticker: 'VALE3',
    name: 'Vale ON',
    type: 'stock',
    last: 6_188,
    volatility: 29,
    dividend: { amountPerUnit: '2.093000' },
    earnings: {
      revenue: 5_320_000_000_000,
      netIncome: 1_380_000_000_000,
      ebitda: 2_210_000_000_000,
      roe: 18.9,
    },
  },
  {
    ticker: 'BBAS3',
    name: 'Banco do Brasil ON',
    type: 'stock',
    last: 2_790,
    volatility: 25,
    dividend: { amountPerUnit: '0.618040', jcpEveryOther: true },
    earnings: { revenue: 3_870_000_000_000, netIncome: 920_000_000_000, ebitda: null, roe: 19.6 },
    events: [
      {
        type: 'split',
        date: '2024-04-16',
        description: 'Desdobramento de ações na proporção de 1 para 2.',
      },
    ],
  },
  {
    ticker: 'HGLG11',
    name: 'CSHG Logística FII',
    type: 'fii',
    last: 15_820,
    volatility: 12,
    dividend: { amountPerUnit: '1.10', monthly: true },
  },
  {
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'fii',
    last: 975,
    volatility: 10,
    dividend: { amountPerUnit: '0.10', monthly: true },
  },
  { ticker: 'IVVB11', name: 'iShares S&P 500 ETF', type: 'etf', last: 38_950, volatility: 17 },
  { ticker: 'BOVA11', name: 'iShares Ibovespa ETF', type: 'etf', last: 13_240, volatility: 20 },
  { ticker: 'AAPL34', name: 'Apple BDR', type: 'bdr', last: 6_210, volatility: 26 },
  { ticker: 'BTC', name: 'Bitcoin', type: 'crypto', last: 35_120_000, volatility: 55 },
  { ticker: 'IBOV', name: 'Ibovespa', type: 'index', last: 13_451_233, volatility: 18 },
];

function dividendsOf(def: AssetDef, today: IsoDate): AssetRecord['dividends'] {
  if (!def.dividend) return [];
  const { amountPerUnit, monthly, jcpEveryOther } = def.dividend;
  const month = monthOf(today);
  const count = monthly ? 12 : 4;
  return Array.from({ length: count }, (_, index) => {
    // FIIs: ex-date at the end of each month, paid mid next month.
    // Stocks: quarterly, ex-date on the 15th, paid 20 days later (the latest one is upcoming).
    const exDate = monthly
      ? dayIn(addMonths(month, -index), 28)
      : dayIn(addMonths(month, -index * 3), 15);
    const paymentDate = monthly ? dayIn(addMonths(monthOf(exDate), 1), 14) : addDays(exDate, 20);
    const type: DividendType = monthly
      ? 'income'
      : jcpEveryOther && index % 2 === 1
        ? 'jcp'
        : 'dividend';
    return { type, exDate, paymentDate, amountPerUnit };
  });
}

export function buildAssets(today: IsoDate, nowIso: string): AssetRecord[] {
  const quotedAt = new Date(Date.parse(nowIso) - 15 * 60_000).toISOString();
  return ASSETS.map((def) => {
    const isIndex = def.type === 'index';
    const record: AssetRecord = {
      quote: {
        ticker: def.ticker,
        name: def.name,
        type: def.type,
        currency: 'BRL',
        logoUrl: null,
        price: isIndex ? null : def.last,
        points: isIndex
          ? `${Math.trunc(def.last / 100)}.${String(def.last % 100).padStart(2, '0')}`
          : null,
        dayChangePercent: null,
        yearLow: null,
        yearHigh: null,
        quotedAt,
      },
      volatility: def.volatility,
      lastEarnings: def.earnings
        ? {
            period: '2T26',
            publishedOn: '2026-08-07',
            revenue: def.earnings.revenue,
            netIncome: def.earnings.netIncome,
            ebitda: def.earnings.ebitda,
            netMargin: Math.round((def.earnings.netIncome / def.earnings.revenue) * 10_000) / 100,
            roe: def.earnings.roe,
          }
        : null,
      dividends: dividendsOf(def, today),
      events: def.events ?? [],
    };
    // Year range and day change come from the same series the chart draws.
    const stats = quoteStats(record);
    record.quote.dayChangePercent = stats.dayChangePercent;
    if (!isIndex) {
      record.quote.yearLow = stats.yearLow;
      record.quote.yearHigh = stats.yearHigh;
    }
    return record;
  });
}

export function priceOf(assets: AssetRecord[], ticker: string): number {
  const price = assets.find((asset) => asset.quote.ticker === ticker)?.quote.price;
  if (price == null) throw new Error(`No price for ${ticker}`);
  return price;
}
