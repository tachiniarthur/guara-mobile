import { cents, formatCents } from '@guara/utils';

import { ASSETS, paymentDate, type FundAsset } from '../../assets';
import { eventsByYear, filterEvents, lastTwelveMonths, receivedSummary } from '../events';

const nbsp = (text: string) => text.replace(/ /g, ' ');
const hglg = ASSETS.HGLG11 as FundAsset;
const items = hglg.events.kind === 'list' ? hglg.events.items : [];

describe('events', () => {
  it('pays on the 15th or the business day before', () => {
    expect(
      ['2026-08', '2026-03', '2025-11', '2025-12'].map((month) => {
        const [year, m] = month.split('-').map(Number) as [number, number];
        return paymentDate(year, m);
      }),
    ).toEqual(['14/08/2026', '13/03/2026', '14/11/2025', '15/12/2025']);
  });

  it('derives the numbers of the design', () => {
    const received = receivedSummary(items)!;
    expect(nbsp(formatCents(received.total))).toBe('R$ 277,20');
    expect(received.since).toBe('abril de 2026');
    const year = lastTwelveMonths(items, cents(16_130))!;
    expect(nbsp(formatCents(year.perUnit))).toBe('R$ 13,20');
    expect(year.yieldText).toBe('8,2%');
    const [y2026, y2025] = eventsByYear(items);
    expect(y2026?.items).toHaveLength(9);
    expect(nbsp(formatCents(y2026!.perUnit!))).toBe('R$ 9,90');
    expect(y2025?.received).toBeNull();
    expect(nbsp(formatCents(y2025!.perUnit!))).toBe('R$ 13,20');
    expect(items.find((item) => item.date === '13/03/2026')?.received).toBeNull();
  });

  it('filters by kind', () => {
    expect(filterEvents(items, 'Amortização')).toEqual([]);
    expect(filterEvents(items, 'all')).toHaveLength(21);
  });
});
