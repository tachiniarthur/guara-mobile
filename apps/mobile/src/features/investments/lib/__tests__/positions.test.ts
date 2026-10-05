import { formatCents } from '@guara/utils';

import { PORTFOLIO, POSITIONS } from '../../data';
import {
  changeText,
  filterPositions,
  groupPositions,
  previewPositions,
  shareText,
  sortPositions,
  tickerFromQuery,
} from '../positions';

const brl = (value: Parameters<typeof formatCents>[0]) =>
  formatCents(value).replace(/\u00a0/g, ' ');
const names = (items: { name: string }[]) => items.map((item) => item.name);

describe('positions data', () => {
  it('derives the portfolio total and the shares from the positions', () => {
    expect(POSITIONS).toHaveLength(12);
    expect(brl(PORTFOLIO.total)).toBe('R$ 48.310,90');
    expect(POSITIONS.reduce((sum, item) => sum + item.share, 0)).toBeCloseTo(100, 6);
    const selic = POSITIONS.find((item) => item.id === 'selic')!;
    expect(shareText(selic.share)).toBe('32,9%');
  });
});

describe('groupPositions', () => {
  it('follows the design classes with totals and shares', () => {
    const groups = groupPositions(sortPositions(POSITIONS, 'valueDesc'));
    expect(
      groups.map(
        (group) =>
          `${group.label} ${group.positions.length} ${brl(group.total)} ${shareText(group.share)}`,
      ),
    ).toEqual([
      'Renda fixa 2 R$ 22.222,10 46,0%',
      'Renda variável 2 R$ 10.691,50 22,1%',
      'Imobiliário 1 R$ 6.774,60 14,0%',
      'Alternativos 1 R$ 4.798,56 9,9%',
      'Internacional 6 R$ 3.824,14 7,9%',
    ]);
  });

  it('leaves out classes without positions', () => {
    const groups = groupPositions(filterPositions(POSITIONS, { query: '', origin: 'openFinance' }));
    expect(groups.map((group) => group.label)).toEqual(['Renda fixa']);
  });
});

describe('filterPositions', () => {
  it('searches name, code and description without accents or case', () => {
    expect(names(filterPositions(POSITIONS, { query: 'hglg11', origin: 'all' }))).toEqual([
      'HGLG11',
    ]);
    expect(names(filterPositions(POSITIONS, { query: 'patria', origin: 'all' }))).toEqual([
      'HGLG11',
    ]);
    expect(filterPositions(POSITIONS, { query: 'bdr', origin: 'all' })).toHaveLength(5);
    expect(filterPositions(POSITIONS, { query: 'ITSA4', origin: 'all' })).toEqual([]);
  });

  it('treats chat registrations as manual', () => {
    const manual = filterPositions(POSITIONS, { query: '', origin: 'manual' });
    expect(manual).toHaveLength(10);
    expect(names(manual)).toContain('HGLG11');
  });
});

describe('sortPositions', () => {
  it('sorts by value, day change and name', () => {
    expect(sortPositions(POSITIONS, 'valueDesc')[0]!.name).toBe('Tesouro Selic 2029');
    expect(sortPositions(POSITIONS, 'valueAsc')[0]!.name).toBe('GOGL34');
    expect(sortPositions(POSITIONS, 'changeDesc')[0]!.name).toBe('Bitcoin');
    expect(sortPositions(POSITIONS, 'name')[0]!.name).toBe('AAPL34');
  });
});

describe('previewPositions', () => {
  it('shows the six biggest and sums the rest (Investimentos card)', () => {
    const { shown, others } = previewPositions(POSITIONS, 6);
    expect(names(shown)).toEqual([
      'Tesouro Selic 2029',
      'PETR4',
      'HGLG11',
      'CDB 110% CDI',
      'Bitcoin',
      'BOVA11',
    ]);
    expect(others && brl(others.total)).toBe('R$ 3.824,14');
    expect(others && `${others.count} · ${shareText(others.share)}`).toBe('6 · 7,9%');
    expect(previewPositions(POSITIONS, 12).others).toBeNull();
  });
});

describe('texts', () => {
  it('formats the day change with sign and typographic minus', () => {
    expect(changeText(0.04)).toBe('+0,04%');
    expect(changeText(-1.12)).toBe('−1,12%');
  });

  it('recognizes B3 codes in the search', () => {
    expect(tickerFromQuery(' itsa4 ')).toBe('ITSA4');
    expect(tickerFromQuery('HGLG11')).toBe('HGLG11');
    expect(tickerFromQuery('apple')).toBeNull();
  });
});
