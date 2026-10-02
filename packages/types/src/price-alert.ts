/** Price alerts (watched by the Caramelo assistant). */
import { z } from 'zod';

import { IsoDateTimeSchema } from './common';
import { PriceAlertIdSchema, TickerSchema } from './ids';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';

/** `buy`: notify when the price falls to the target or below; `sell`: rises to it or above. */
export const PriceAlertSideSchema = z.enum(['buy', 'sell']);
export type PriceAlertSide = z.infer<typeof PriceAlertSideSchema>;

export const PriceAlertStatusSchema = z.enum(['active', 'triggered', 'cancelled']);
export type PriceAlertStatus = z.infer<typeof PriceAlertStatusSchema>;

export const PriceAlertSchema = z.object({
  id: PriceAlertIdSchema,
  ticker: TickerSchema,
  assetName: z.string().min(1),
  side: PriceAlertSideSchema,
  targetPrice: PositiveCentsSchema,
  status: PriceAlertStatusSchema,
  currentPrice: NonNegativeCentsSchema.nullable(),
  createdAt: IsoDateTimeSchema,
  triggeredAt: IsoDateTimeSchema.nullable(),
  triggeredPrice: NonNegativeCentsSchema.nullable(),
});
export type PriceAlert = z.infer<typeof PriceAlertSchema>;

export const CreatePriceAlertBodySchema = z.object({
  ticker: TickerSchema,
  side: PriceAlertSideSchema,
  targetPrice: PositiveCentsSchema,
});
export type CreatePriceAlertBody = z.infer<typeof CreatePriceAlertBodySchema>;
