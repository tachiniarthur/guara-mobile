import { NBSP, cents, formatCents, formatCentsCompact, formatCentsForSpeech } from '../money';
import { formatPercent } from '../percent';

const s = (text: string) => text.replace(/ /g, NBSP);

describe('formatCentsCompact()', () => {
  it.each([
    [99_999, 'R$ 999,99'],
    [100_000, 'R$ 1 mil'],
    [123_456, 'R$ 1,2 mil'],
    [125_000, 'R$ 1,3 mil'],
    [4_550_000, 'R$ 45,5 mil'],
    [99_995_000, 'R$ 1 mi'],
    [123_456_789, 'R$ 1,2 mi'],
    [150_000_000_000, 'R$ 1,5 bi'],
    [-123_456, '-R$ 1,2 mil'],
  ])('%p → %p', (value, expected) => {
    expect(formatCentsCompact(cents(value))).toBe(s(expected));
  });

  it('supports sign display and renders "—" for missing values', () => {
    expect(formatCentsCompact(cents(250_000), { signDisplay: 'always' })).toBe(s('+R$ 2,5 mil'));
    expect(formatCentsCompact(null)).toBe('—');
    expect(formatCentsCompact(1.5)).toBe('—');
  });
});

describe('formatCentsForSpeech()', () => {
  it.each([
    [123_456, '1.234 reais e 56 centavos'],
    [100, '1 real'],
    [101, '1 real e 1 centavo'],
    [5, '5 centavos'],
    [0, '0 reais'],
    [-150, 'menos 1 real e 50 centavos'],
    [100_000_000, '1.000.000 reais'],
  ])('%p → %p', (value, expected) => {
    expect(formatCentsForSpeech(cents(value))).toBe(expected);
  });

  it('handles other currencies and missing values', () => {
    expect(formatCentsForSpeech(cents(250), 'USD')).toBe('2 dólares e 50 centavos');
    expect(formatCentsForSpeech(null)).toBe('sem informação');
  });
});

describe('formatCents display options', () => {
  it('drops the cents with wholeUnits (truncating toward zero)', () => {
    expect(formatCents(cents(74218), { wholeUnits: true })).toBe(`R$${NBSP}742`);
    expect(formatCents(cents(228753), { wholeUnits: true })).toBe(`R$${NBSP}2.287`);
    expect(formatCents(cents(-40), { wholeUnits: true })).toBe(`R$${NBSP}0`);
  });

  it('uses the typographic minus when asked', () => {
    expect(formatCents(cents(-1840), { typographicMinus: true })).toBe(`−R$${NBSP}18,40`);
    expect(formatCents(cents(-1840))).toBe(`-R$${NBSP}18,40`);
    expect(formatPercent(-6, { fractionDigits: 0, typographicMinus: true })).toBe('−6%');
  });
});
