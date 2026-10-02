/**
 * Shared primitives for every contract.
 *
 * Schemas are the single source of truth: types are derived with `z.infer`, and the same
 * schemas validate API responses in the app and (later) requests in the NestJS API.
 * Keep schemas free of transforms/defaults so the wire shape and the parsed shape match.
 *
 * Conventions:
 * - Dates travel as ISO 8601 strings. Instants are UTC (`IsoDateTime`); calendar dates
 *   (`IsoDate`) are already São Paulo days. Conversion for display is done by `@guara/utils`.
 * - Missing data is `null` — never `0` or `""`. The UI renders it as "—".
 * - Enum values are English identifiers; pt-BR labels live in the app.
 */
import { z } from 'zod';

/** Instant in UTC with `Z`, e.g. "2026-10-01T12:00:00.000Z". Display with `formatDateTime()`. */
export const IsoDateTimeSchema = z.iso.datetime();
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

/** Calendar date without time in America/Sao_Paulo, e.g. "2026-10-01". */
export const IsoDateSchema = z.iso.date();
export type IsoDate = z.infer<typeof IsoDateSchema>;

/** Calendar month in America/Sao_Paulo, e.g. "2026-10". */
export const YearMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected YYYY-MM');
export type YearMonth = z.infer<typeof YearMonthSchema>;

/**
 * Non-negative decimal written as a string, for fractional quantities (fund shares,
 * crypto): "200", "0.00314". Never convert to a float for math — use the decimal helpers
 * of `@guara/utils`.
 */
export const DecimalStringSchema = z
  .string()
  .regex(/^(0|[1-9]\d*)(\.\d+)?$/, 'Expected a decimal string like "12.345"')
  .brand<'DecimalString'>();
export type DecimalString = z.infer<typeof DecimalStringSchema>;

/** `createdAt`/`updatedAt` present on persisted entities. Spread into object schemas. */
export const timestamps = {
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
};

// --- Envelopes -------------------------------------------------------------------------------

/** Cursor-based page returned by list endpoints. */
export interface Paginated<T> {
  items: T[];
  /** Opaque cursor for the next page; `null` on the last page. */
  nextCursor: string | null;
}

export function paginated<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), nextCursor: z.string().min(1).nullable() });
}

export const MAX_PAGE_SIZE = 100;

/**
 * Query of paginated endpoints. Over HTTP every query value is a string: the API must
 * coerce numbers/booleans before validating with these schemas.
 */
export const CursorQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.int().min(1).max(MAX_PAGE_SIZE).optional(),
});
export type CursorQuery = z.infer<typeof CursorQuerySchema>;

export const ApiErrorCodeSchema = z.enum([
  'bad_request',
  'validation_failed',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'plan_limit_reached',
  'rate_limited',
  'internal',
  'unavailable',
  /** Client-side: the request took too long. */
  'timeout',
  /** Client-side: the request never reached the API (offline, DNS…). */
  'network',
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

/** Error body returned by every endpoint. `message` is pt-BR and safe to show to the user. */
export const ApiErrorSchema = z.object({
  code: ApiErrorCodeSchema,
  message: z.string().min(1),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

// --- Periods ---------------------------------------------------------------------------------

/** Shortcuts resolved by the API in São Paulo time. */
export const PeriodPresetSchema = z.enum([
  'this_month',
  'last_month',
  'last_3_months',
  'last_6_months',
  'last_12_months',
  'this_year',
]);
export type PeriodPreset = z.infer<typeof PeriodPresetSchema>;

/** Inclusive range of calendar dates. */
export const DateRangeSchema = z
  .object({ from: IsoDateSchema, to: IsoDateSchema })
  .refine(({ from, to }) => from <= to, { message: '`from` must not be after `to`' });
export type DateRange = z.infer<typeof DateRangeSchema>;

export const PeriodSchema = z.union([PeriodPresetSchema, DateRangeSchema]);
/** A preset (`'this_month'`) or an explicit range (`{ from, to }`). */
export type Period = z.infer<typeof PeriodSchema>;

/** Flat form of `Period` for query strings: `period=this_month` or `from=…&to=…`. */
export const PeriodQuerySchema = z.object({
  period: PeriodPresetSchema.optional(),
  from: IsoDateSchema.optional(),
  to: IsoDateSchema.optional(),
});
export type PeriodQuery = z.infer<typeof PeriodQuerySchema>;
