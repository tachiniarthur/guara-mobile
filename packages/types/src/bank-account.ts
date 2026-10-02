import { z } from 'zod';

import { IsoDateSchema, IsoDateTimeSchema } from './common';
import { AccountIdSchema, BankConnectionIdSchema, InstitutionIdSchema } from './ids';
import { CentsSchema, CurrencySchema, NonNegativeCentsSchema } from './money';

export const BankAccountTypeSchema = z.enum(['checking', 'savings', 'credit_card']);
export type BankAccountType = z.infer<typeof BankAccountTypeSchema>;

export const BankAccountSchema = z.object({
  id: AccountIdSchema,
  connectionId: BankConnectionIdSchema,
  institutionId: InstitutionIdSchema,
  type: BankAccountTypeSchema,
  /** Name given by the institution, e.g. "Conta corrente". */
  name: z.string().min(1),
  /** Masked number, e.g. "•••• 1234". */
  maskedNumber: z.string().nullable(),
  currency: CurrencySchema,
  /**
   * Checking/savings: available balance (may be negative when using the overdraft).
   * Credit card: amount of the open bill (positive = owed).
   */
  balance: CentsSchema.nullable(),
  /** Credit cards only. */
  creditLimit: NonNegativeCentsSchema.nullable(),
  /** Credit cards only: due date of the open bill. */
  billDueOn: IsoDateSchema.nullable(),
  balanceUpdatedAt: IsoDateTimeSchema.nullable(),
});
export type BankAccount = z.infer<typeof BankAccountSchema>;
