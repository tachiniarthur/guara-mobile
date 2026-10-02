/** Open Finance connections, made through the Malvo widget (WebView). */
import { z } from 'zod';

import { IsoDateTimeSchema, timestamps } from './common';
import { BankAccountSchema } from './bank-account';
import { BankConnectionIdSchema, InstitutionIdSchema } from './ids';

export const InstitutionSchema = z.object({
  id: InstitutionIdSchema,
  name: z.string().min(1),
  logoUrl: z.url().nullable(),
});
export type Institution = z.infer<typeof InstitutionSchema>;

/**
 * Lifecycle of an Open Finance consent:
 * `expiring` = still valid but ends soon (the user should renew); `expired` = needs a new
 * consent; `revoked` = cancelled by the user; `error` = sync failing at the institution.
 */
export const BankConnectionStatusSchema = z.enum([
  'active',
  'expiring',
  'expired',
  'revoked',
  'error',
]);
export type BankConnectionStatus = z.infer<typeof BankConnectionStatusSchema>;

export const BankConnectionSchema = z.object({
  id: BankConnectionIdSchema,
  institution: InstitutionSchema,
  status: BankConnectionStatusSchema,
  /** When the consent stops being valid. */
  consentExpiresAt: IsoDateTimeSchema.nullable(),
  lastSyncedAt: IsoDateTimeSchema.nullable(),
  accounts: z.array(BankAccountSchema),
  ...timestamps,
});
export type BankConnection = z.infer<typeof BankConnectionSchema>;

/** Short-lived token used to open the Malvo widget (new connection or consent renewal). */
export const ConnectTokenSchema = z.object({
  widgetUrl: z.url(),
  token: z.string().min(1),
  expiresAt: IsoDateTimeSchema,
});
export type ConnectToken = z.infer<typeof ConnectTokenSchema>;
