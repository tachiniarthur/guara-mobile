import { normalizeForSearch } from '../text';

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
