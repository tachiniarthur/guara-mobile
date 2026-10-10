import { joinList, normalizeForSearch } from '../text';

describe('normalizeForSearch', () => {
  it('drops accents, case and outer spaces', () => {
    expect(normalizeForSearch('  Pátria LOG ')).toBe('patria log');
    expect(normalizeForSearch('Ação · Médio')).toBe('acao · medio');
  });

  it('keeps digits and symbols', () => {
    expect(normalizeForSearch('HGLG11')).toBe('hglg11');
    expect(normalizeForSearch('CDB 110% CDI')).toBe('cdb 110% cdi');
  });
});

describe('joinList', () => {
  it('joins with commas and "e"', () => {
    expect(joinList([])).toBe('');
    expect(joinList(['Nubank'])).toBe('Nubank');
    expect(joinList(['Nubank', 'Itaú'])).toBe('Nubank e Itaú');
    expect(joinList(['Nubank', 'Itaú', 'Inter'])).toBe('Nubank, Itaú e Inter');
  });
});
