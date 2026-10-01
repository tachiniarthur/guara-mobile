import type { Entity, ISODateTime } from './common';

/** Lifecycle of an Open Finance consent (via Malvo). */
export type BankConnectionStatus =
  'pending' | 'active' | 'expiring' | 'expired' | 'revoked' | 'error';

export interface BankConnection extends Entity {
  institutionId: string;
  institutionName: string;
  institutionLogoUrl: string | null;
  status: BankConnectionStatus;
  /** When the consent stops being valid; renewal is required after this date. */
  consentExpiresAt: ISODateTime | null;
  lastSyncedAt: ISODateTime | null;
}

export type BankAccountType = 'checking' | 'savings' | 'credit_card' | 'investment';

export interface BankAccount extends Entity {
  connectionId: string;
  type: BankAccountType;
  name: string;
  /** Masked number, e.g. "•••• 1234". */
  maskedNumber: string | null;
}
