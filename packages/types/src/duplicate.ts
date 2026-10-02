/** The same investment reported twice (e.g. via Open Finance and typed in manually). */
import { z } from 'zod';

import { IsoDateTimeSchema } from './common';
import { DuplicateIdSchema, PositionIdSchema } from './ids';
import { PositionSchema } from './position';

/**
 * `sum`: merge into one position adding quantities and values; `keep_separate`: they are
 * different investments; `delete_one`: drop one of them (`deletePositionId`).
 */
export const DuplicateResolutionSchema = z.enum(['sum', 'keep_separate', 'delete_one']);
export type DuplicateResolution = z.infer<typeof DuplicateResolutionSchema>;

export const PositionDuplicateSchema = z.object({
  id: DuplicateIdSchema,
  positions: z.tuple([PositionSchema, PositionSchema]),
  status: z.enum(['pending', 'resolved']),
  resolution: DuplicateResolutionSchema.nullable(),
  detectedAt: IsoDateTimeSchema,
  resolvedAt: IsoDateTimeSchema.nullable(),
});
export type PositionDuplicate = z.infer<typeof PositionDuplicateSchema>;

export const ResolveDuplicateBodySchema = z.discriminatedUnion('resolution', [
  z.object({ resolution: z.literal('sum') }),
  z.object({ resolution: z.literal('keep_separate') }),
  z.object({ resolution: z.literal('delete_one'), deletePositionId: PositionIdSchema }),
]);
export type ResolveDuplicateBody = z.infer<typeof ResolveDuplicateBodySchema>;
