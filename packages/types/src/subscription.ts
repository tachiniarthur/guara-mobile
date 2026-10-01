import type { Entity, ISODate } from './common';
import type { Cents, Currency } from './money';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription extends Entity {
  name: string;
  amount: Cents;
  currency: Currency;
  cycle: BillingCycle;
  nextChargeOn: ISODate | null;
  categoryId: string | null;
  status: SubscriptionStatus;
}
