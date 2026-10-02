import {
  ApiErrorSchema,
  CentsSchema,
  DateRangeSchema,
  DecimalStringSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  PeriodSchema,
  PositiveCentsSchema,
  TransactionIdSchema,
  YearMonthSchema,
} from '../index';

const ok = (schema: { safeParse: (value: unknown) => { success: boolean } }, value: unknown) =>
  schema.safeParse(value).success;

describe('primitives', () => {
  it('Cents accepts only safe integers', () => {
    expect(ok(CentsSchema, 123456)).toBe(true);
    expect(ok(CentsSchema, -500)).toBe(true);
    expect(ok(CentsSchema, 12.5)).toBe(false);
    expect(ok(CentsSchema, Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(ok(CentsSchema, '100')).toBe(false);
    expect(ok(PositiveCentsSchema, 0)).toBe(false);
  });

  it('DecimalString keeps fractional quantities out of floats', () => {
    for (const value of ['0', '200', '0.00314']) expect(ok(DecimalStringSchema, value)).toBe(true);
    for (const value of [0.5, '.5', '1.', '-1', '1e3', '1,5', '']) {
      expect(ok(DecimalStringSchema, value)).toBe(false);
    }
  });

  it('dates are ISO strings: instants in UTC, calendar dates and months', () => {
    expect(ok(IsoDateTimeSchema, '2026-10-01T12:00:00.000Z')).toBe(true);
    expect(ok(IsoDateTimeSchema, '2026-10-01T09:00:00-03:00')).toBe(false);
    expect(ok(IsoDateSchema, '2026-10-01')).toBe(true);
    expect(ok(IsoDateSchema, '2026-02-30')).toBe(false);
    expect(ok(YearMonthSchema, '2026-10')).toBe(true);
    expect(ok(YearMonthSchema, '2026-13')).toBe(false);
  });

  it('ids are non-empty strings', () => {
    expect(ok(TransactionIdSchema, 'tx_1')).toBe(true);
    expect(ok(TransactionIdSchema, '')).toBe(false);
  });

  it('Period is a preset or an ordered range', () => {
    expect(ok(PeriodSchema, 'this_month')).toBe(true);
    expect(ok(PeriodSchema, { from: '2026-09-01', to: '2026-09-30' })).toBe(true);
    expect(ok(DateRangeSchema, { from: '2026-10-01', to: '2026-09-30' })).toBe(false);
    expect(ok(PeriodSchema, 'yesterday')).toBe(false);
  });

  it('ApiError has a known code and a message', () => {
    expect(ok(ApiErrorSchema, { code: 'not_found', message: 'Teto não encontrado.' })).toBe(true);
    expect(ok(ApiErrorSchema, { code: 'teapot', message: 'x' })).toBe(false);
  });
});
