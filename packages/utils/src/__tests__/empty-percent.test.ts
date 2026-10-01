import { cents } from '../money';
import { EMPTY, isEmptyValue, orEmpty } from '../empty';
import { formatPercent, percentChange, ratioToPercent } from '../percent';

describe('empty', () => {
  it('detects missing values', () => {
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue(undefined)).toBe(true);
    expect(isEmptyValue('  ')).toBe(true);
    expect(isEmptyValue(Number.NaN)).toBe(true);
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue(false)).toBe(false);
  });

  it('orEmpty() returns "—" or the formatted value', () => {
    expect(EMPTY).toBe('—');
    expect(orEmpty(null)).toBe('—');
    expect(orEmpty('Ana')).toBe('Ana');
    expect(orEmpty(0)).toBe('0');
    expect(orEmpty(2, (n) => `${n}x`)).toBe('2x');
  });
});

describe('percent', () => {
  it('formats in pt-BR', () => {
    expect(formatPercent(12.345)).toBe('12,35%');
    expect(formatPercent(-3.5, { fractionDigits: 1 })).toBe('-3,5%');
    expect(formatPercent(1.2, { signDisplay: 'always' })).toBe('+1,20%');
    expect(formatPercent(1234.5)).toBe('1.234,50%');
    expect(formatPercent(50, { fractionDigits: 0 })).toBe('50%');
    expect(formatPercent(-0.001)).toBe('0,00%');
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(Number.POSITIVE_INFINITY)).toBe('—');
  });

  it('converts ratios and computes changes', () => {
    expect(ratioToPercent(0.125)).toBe(12.5);
    expect(percentChange(cents(1000), cents(1250))).toBe(25);
    expect(percentChange(cents(-1000), cents(-500))).toBe(50);
    expect(percentChange(cents(0), cents(100))).toBeNull();
  });
});
