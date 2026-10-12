import type {
  Cents,
  IsoDate,
  IsoDateTime,
  NotificationChannel,
  PriceAlertSide,
  PriceAlertStatus,
} from '@guara/types';
import { cents } from '@guara/utils';

/** Quote of an asset (Brapi via our API) with the last 30 days when we have them. */
export interface AssetQuote {
  ticker: string;
  name: string;
  /** Mark in the asset tile ("₿"). */
  symbol: string;
  price: Cents;
  quotedAt: IsoDateTime;
  /** Daily closes in whole reais, oldest first, from `start`; `null` without history. */
  history: { start: IsoDate; values: readonly number[] } | null;
}

/** Quotes as shown in the design (static until the API exists). */
export const QUOTES: Record<string, AssetQuote> = {
  BTC: {
    ticker: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    price: cents(61_520_000),
    quotedAt: '2026-09-23T17:30:00.000Z',
    history: {
      start: '2026-08-25',
      values: [
        560000, 576900, 575500, 577800, 595600, 602800, 593900, 595800, 607000, 601000, 586200,
        587800, 591500, 576600, 564100, 569700, 569900, 555700, 553600, 566600, 567400, 560500,
        571700, 589400, 590400, 591000, 609800, 624300, 620800, 615200,
      ],
    },
  },
  PETR4: {
    ticker: 'PETR4',
    name: 'PETR4',
    symbol: 'P',
    price: cents(3_782),
    quotedAt: '2026-09-23T17:30:00.000Z',
    history: null,
  },
  IVVB11: {
    ticker: 'IVVB11',
    name: 'IVVB11',
    symbol: 'I',
    price: cents(35_140),
    quotedAt: '2026-09-23T17:30:00.000Z',
    history: null,
  },
};

/** What the user sets on a price alert, and what the API says happened to it. */
export interface PriceAlertItem {
  id: string;
  ticker: string;
  side: PriceAlertSide;
  targetPrice: Cents;
  status: Exclude<PriceAlertStatus, 'cancelled'>;
  channels: NotificationChannel[];
  /** `null` when the design does not say. */
  createdAt: IsoDateTime | null;
  triggeredAt: IsoDateTime | null;
  triggeredPrice: Cents | null;
}

export const PRICE_ALERTS: PriceAlertItem[] = [
  {
    id: 'alert-btc',
    ticker: 'BTC',
    side: 'sell',
    targetPrice: cents(65_000_000),
    status: 'active',
    channels: ['push', 'email'],
    createdAt: '2026-09-15T13:00:00.000Z',
    triggeredAt: null,
    triggeredPrice: null,
  },
  {
    id: 'alert-petr4',
    ticker: 'PETR4',
    side: 'buy',
    targetPrice: cents(3_400),
    status: 'active',
    channels: ['push', 'email'],
    createdAt: null,
    triggeredAt: null,
    triggeredPrice: null,
  },
  {
    id: 'alert-ivvb11',
    ticker: 'IVVB11',
    side: 'buy',
    targetPrice: cents(33_000),
    status: 'active',
    channels: ['push', 'email'],
    createdAt: null,
    triggeredAt: null,
    triggeredPrice: null,
  },
];

/** Shortcuts of the trigger value (% from the current price). */
export const SHORTCUTS = [5, 10, 20] as const;
