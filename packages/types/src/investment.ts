import type { Entity } from './common';
import type { InvestorProfileType } from './investor-profile';
import type { Cents, Currency } from './money';

export type InvestmentClass =
  | 'fixed_income'
  | 'stocks'
  | 'real_estate_funds'
  | 'international'
  | 'crypto'
  | 'multimarket'
  | 'cash';

export type InvestmentOrigin = 'open_finance' | 'manual';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface InvestmentPosition extends Entity {
  name: string;
  ticker: string | null;
  class: InvestmentClass;
  origin: InvestmentOrigin;
  risk: RiskLevel;
  quantity: number | null;
  currentValue: Cents | null;
  investedValue: Cents | null;
  currency: Currency;
}

export interface AllocationSlice {
  class: InvestmentClass;
  /** Percentage of the portfolio (0–100). */
  currentPercent: number;
  targetPercent: number | null;
}

export interface Allocation {
  profile: InvestorProfileType | null;
  slices: AllocationSlice[];
}
