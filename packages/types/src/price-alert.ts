/** Price alerts (watched by the Caramelo assistant). */
import { z } from 'zod';

import { IsoDateTimeSchema } from './common';
import { PriceAlertIdSchema, TickerSchema } from './ids';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { NotificationChannelsSchema } from './notification';

/** `buy`: notify when the price falls to the target or below; `sell`: rises to it or above. */
export const PriceAlertSideSchema = z.enum(['buy', 'sell']);
export type PriceAlertSide = z.infer<typeof PriceAlertSideSchema>;

/**
 * `active`: checked at every quote. `paused`: by the user. `triggered`: notified once and paused
 * until the user renews it with another target or cancels it. `cancelled`: no longer listed.
 */
export const PriceAlertStatusSchema = z.enum(['active', 'paused', 'triggered', 'cancelled']);
export type PriceAlertStatus = z.infer<typeof PriceAlertStatusSchema>;

export const PriceAlertSchema = z.object({
  id: PriceAlertIdSchema,
  ticker: TickerSchema,
  assetName: z.string().min(1),
  side: PriceAlertSideSchema,
  targetPrice: PositiveCentsSchema,
  status: PriceAlertStatusSchema,
  channels: NotificationChannelsSchema,
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
  channels: NotificationChannelsSchema,
});
export type CreatePriceAlertBody = z.infer<typeof CreatePriceAlertBodySchema>;

/** Edit, pause/resume, or renew a triggered alert with another target (`status: 'active'`). */
export const UpdatePriceAlertBodySchema = z.object({
  side: PriceAlertSideSchema.optional(),
  targetPrice: PositiveCentsSchema.optional(),
  channels: NotificationChannelsSchema.optional(),
  status: z.enum(['active', 'paused']).optional(),
});
export type UpdatePriceAlertBody = z.infer<typeof UpdatePriceAlertBodySchema>;
