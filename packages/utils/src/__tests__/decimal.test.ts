import type { Cents } from '@guara/types';

import {
  addDecimals,
  divideCentsByDecimal,
  isDecimalString,
  multiplyCentsByDecimal,
  multiplyReaisByDecimal,
} from '../decimal';

const c = (value: number) => value as Cents;

describe('decimal strings', () => {
  it('validates the canonical format', () => {
    for (const value of ['0', '200', '0.00314', '10.5']) expect(isDecimalString(value)).toBe(true);
    for (const value of ['', '.5', '1.', '01', '-1', '1e-3', '1,5', ' 1', 12]) {
      expect(isDecimalString(value)).toBe(false);
    }
  });

  it('adds exactly, without float errors', () => {
    expect(addDecimals('0.1', '0.2')).toBe('0.3');
    expect(addDecimals('200', '15.250')).toBe('215.25');
    expect(addDecimals('0.00314', '0.00686')).toBe('0.01');
    expect(addDecimals('0', '0')).toBe('0');
  });

  it('multiplies a unit price in cents by a quantity', () => {
    expect(multiplyCentsByDecimal(c(3842), '200')).toBe(768400);
    // 0.0315 BTC × R$ 350.000,00
    expect(multiplyCentsByDecimal(c(35_000_000), '0.0315')).toBe(1_102_500);
    // 1,5 centavo rounds half away from zero to 2; 1,4 to 1
    expect(multiplyCentsByDecimal(c(1), '1.5')).toBe(2);
    expect(multiplyCentsByDecimal(c(1), '1.4')).toBe(1);
  });

  it('multiplies a per-unit value in reais by a quantity', () => {
    expect(multiplyReaisByDecimal('0.452318', '300')).toBe(13570);
    expect(multiplyReaisByDecimal('1.10', '40')).toBe(4400);
    expect(multiplyReaisByDecimal('0.005', '1')).toBe(1);
  });

  it('rejects invalid input', () => {
    expect(() => addDecimals('1,5')).toThrow(RangeError);
    expect(() => multiplyCentsByDecimal(c(-1), '1')).toThrow(RangeError);
  });
});

describe('divideCentsByDecimal', () => {
  it('computes average prices rounded to cents', () => {
    expect(divideCentsByDecimal(c(621000), '200')).toBe(3105);
    expect(divideCentsByDecimal(c(1000), '3')).toBe(333);
    expect(divideCentsByDecimal(c(2000), '3')).toBe(667);
    expect(divideCentsByDecimal(c(938700), '0.0315')).toBe(29800000);
  });

  it('rejects a zero quantity', () => {
    expect(() => divideCentsByDecimal(c(100), '0')).toThrow(RangeError);
  });
});
