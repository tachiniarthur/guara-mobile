/** Purchases out of the user's usual pattern (watched by the Quero-quero assistant). */
import { z } from 'zod';

import { IsoDateTimeSchema } from './common';
import { TransactionSchema } from './transaction';

export const UnusualReasonSchema = z.enum([
  'unusual_amount',
  'unusual_time',
  'unusual_location',
  'new_category',
]);
export type UnusualReason = z.infer<typeof UnusualReasonSchema>;

/**
 * `acknowledged`: the user confirmed the purchase was theirs ("Fui eu");
 * `reported`: the user does not recognise it ("Não reconheço").
 */
export const UnusualStatusSchema = z.enum(['pending', 'acknowledged', 'reported']);
export type UnusualStatus = z.infer<typeof UnusualStatusSchema>;

export const UnusualTransactionSchema = z.object({
  transaction: TransactionSchema,
  reasons: z.array(UnusualReasonSchema).min(1),
  status: UnusualStatusSchema,
  detectedAt: IsoDateTimeSchema,
});
export type UnusualTransaction = z.infer<typeof UnusualTransactionSchema>;
