import { formatCents } from '@guara/utils';

import { TIMELINE_MONTH } from '../../timeline-data';
import { dayLabel, filterDay, hiddenNote, summarize } from '../timeline';

const nbsp = (text: string) => text.replace(/ /g, ' ');

describe('timeline', () => {
  it('derives the totals and the end-of-day balances of the design', () => {
    const summary = summarize(TIMELINE_MONTH.opening, TIMELINE_MONTH.days);
    expect(nbsp(formatCents(summary.totalIn))).toBe('R$ 8.200,00');
    expect(nbsp(formatCents(summary.totalOut))).toBe('R$ 5.912,47');
    expect(nbsp(formatCents(summary.closing))).toBe('R$ 12.480,32');
    const shown = TIMELINE_MONTH.days
      .map((day, index) => (day.hidden ? null : nbsp(formatCents(summary.balances[index]!))))
      .filter(Boolean);
    expect(shown).toEqual([
      'R$ 12.480,32',
      'R$ 13.739,72',
      'R$ 14.252,72',
      'R$ 14.418,82',
      'R$ 14.617,22',
      'R$ 14.771,84',
      'R$ 13.864,14',
      'R$ 14.477,79',
      'R$ 15.105,29',
      'R$ 10.118,09',
    ]);
  });

  it('writes the labels', () => {
    expect(dayLabel('2026-09-23', '2026-09-23')).toBe('23 set · qua');
    expect(dayLabel('2026-09-15', '2026-09-17')).toBe('15 a 17 set');
    expect(hiddenNote(TIMELINE_MONTH.days)).toBe(
      'Dias 2 a 4, 6 a 9 e 11 a 14 agrupados. Toque em “Mostrar todos os dias” para abrir cada um.',
    );
  });

  it('filters entries', () => {
    const today = TIMELINE_MONTH.days[0]!;
    expect(filterDay(today, 'unusual').entries.map((entry) => entry.title)).toEqual([
      'Loja de eletrônicos online',
    ]);
    expect(filterDay(TIMELINE_MONTH.days[1]!, 'in')).toEqual({ entries: [], showGroup: false });
  });
});
