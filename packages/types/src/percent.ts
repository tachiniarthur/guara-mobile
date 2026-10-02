/**
 * Percent convention — the same one used by `formatPercent()` in `@guara/utils`: a number in
 * **percentage points**. `12.5` means 12,5% (not `0.125`, not basis points).
 *
 * Percentages are not money, so floats are acceptable; round only when displaying.
 * Portfolio shares (`portfolioPercent`, allocation slices) carry at most 2 decimals and sum to
 * exactly 100 (the API distributes rounding with the largest-remainder method).
 */
import { z } from 'zod';

/** Number in percentage points: 12.5 = 12,5%. Negative values are allowed (losses, drops). */
export const PercentSchema = z.number();
export type Percent = z.infer<typeof PercentSchema>;

/** Share between 0 and 100 (e.g. part of the portfolio, warning threshold). */
export const ShareSchema = z.number().min(0).max(100);
export type Share = z.infer<typeof ShareSchema>;
