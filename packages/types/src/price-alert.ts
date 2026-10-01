import type { Entity, ISODateTime } from './common';
import type { Cents } from './money';

export type PriceAlertSide = 'buy' | 'sell';

export type PriceAlertStatus = 'active' | 'triggered' | 'disabled';

export interface PriceAlert extends Entity {
  ticker: string;
  side: PriceAlertSide;
  targetPrice: Cents;
  status: PriceAlertStatus;
  triggeredAt: ISODateTime | null;
}
