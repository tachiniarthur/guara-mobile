import {
  NBSP,
  absCents,
  addCents,
  cents,
  formatCents,
  isCents,
  multiplyCents,
  negateCents,
  parseToCents,
  splitCents,
  subtractCents,
  sumCents,
} from '../money';

const brl = (text: string) => text.replace(' ', NBSP);

describe('cents()', () => {
  it('accepts safe integers', () => {
    expect(cents(0)).toBe(0);
    expect(cents(-150)).toBe(-150);
  });

  it.each([1.5, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects %p', (value) => {
    expect(() => cents(value)).toThrow(RangeError);
  });

  it('isCents() narrows only safe integers', () => {
    expect(isCents(10)).toBe(true);
    expect(isCents(0.1)).toBe(false);
    expect(isCents('10')).toBe(false);
  });
});

describe('integer arithmetic', () => {
  it('sums without floating point drift (0,10 + 0,20 = 0,30)', () => {
    expect(addCents(cents(10), cents(20))).toBe(30);
    expect(sumCents([cents(1999), cents(1), cents(-500)])).toBe(1500);
    expect(sumCents([])).toBe(0);
  });

  it('throws when a sum overflows the safe integer range', () => {
    expect(() => sumCents([cents(Number.MAX_SAFE_INTEGER), cents(1)])).toThrow(RangeError);
  });

  it('subtracts, negates and takes the absolute value', () => {
    expect(subtractCents(cents(1000), cents(1250))).toBe(-250);
    expect(negateCents(cents(250))).toBe(-250);
    expect(Object.is(negateCents(cents(0)), 0)).toBe(true);
    expect(absCents(cents(-99))).toBe(99);
  });

  it('multiplies and rounds half away from zero', () => {
    expect(multiplyCents(cents(1000), 0.1)).toBe(100);
    expect(multiplyCents(cents(5), 0.5)).toBe(3);
    expect(multiplyCents(cents(-5), 0.5)).toBe(-3);
    expect(multiplyCents(cents(333), 1 / 3)).toBe(111);
    expect(() => multiplyCents(cents(1), Number.NaN)).toThrow(RangeError);
  });

  it('splits into installments that add up to the total', () => {
    expect(splitCents(cents(1000), 3)).toEqual([334, 333, 333]);
    expect(splitCents(cents(-1000), 3)).toEqual([-334, -333, -333]);
    expect(splitCents(cents(2), 4)).toEqual([1, 1, 0, 0]);
    const parts = splitCents(cents(123457), 12);
    expect(sumCents(parts)).toBe(123457);
    expect(() => splitCents(cents(100), 0)).toThrow(RangeError);
  });
});

describe('formatCents()', () => {
  it.each([
    [123456, 'R$ 1.234,56'],
    [0, 'R$ 0,00'],
    [5, 'R$ 0,05'],
    [100, 'R$ 1,00'],
    [-123456, '-R$ 1.234,56'],
    [123456789012, 'R$ 1.234.567.890,12'],
  ])('formats %p as %p', (value, expected) => {
    expect(formatCents(value)).toBe(brl(expected));
  });

  it('matches Intl pt-BR output', () => {
    const intl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    for (const value of [0, 1, 99, 100, 123456, -98765, 100000000]) {
      expect(formatCents(value)).toBe(intl.format(value / 100));
    }
  });

  it('supports sign display and symbol options', () => {
    expect(formatCents(1050, { signDisplay: 'always' })).toBe(brl('+R$ 10,50'));
    expect(formatCents(0, { signDisplay: 'always' })).toBe(brl('R$ 0,00'));
    expect(formatCents(-1050, { signDisplay: 'never' })).toBe(brl('R$ 10,50'));
    expect(formatCents(123456, { hideSymbol: true })).toBe('1.234,56');
    expect(formatCents(1050, { currency: 'USD' })).toBe(brl('US$ 10,50'));
  });

  it('renders "—" for missing or invalid values', () => {
    expect(formatCents(null)).toBe('—');
    expect(formatCents(undefined)).toBe('—');
    expect(formatCents(10.5)).toBe('—');
    expect(formatCents(Number.NaN)).toBe('—');
  });
});

describe('parseToCents()', () => {
  it.each([
    ['R$ 1.234,56', 123456],
    [`R$${NBSP}1.234,56`, 123456],
    ['1234,56', 123456],
    ['1.234', 123400],
    ['1.234.567', 123456700],
    ['0,99', 99],
    ['12,5', 1250],
    ['-12,5', -1250],
    ['-R$ 3,00', -300],
    ['+10', 1000],
    ['  42  ', 4200],
    ['-0,00', 0],
  ])('parses %p → %p', (input, expected) => {
    expect(parseToCents(input)).toBe(expected);
  });

  it.each(['', 'abc', '1,234', '12.34', '1.23,00', '10,', ',5', '1,2,3', '--1', null, undefined])(
    'rejects %p',
    (input) => {
      expect(parseToCents(input)).toBeNull();
    },
  );

  it('round-trips with formatCents()', () => {
    for (const value of [0, 1, 99, 100, 123456, -98765]) {
      expect(parseToCents(formatCents(value))).toBe(value);
    }
  });
});
