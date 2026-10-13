import { formatCents } from '@guara/utils';

import { SUBSCRIPTIONS } from '../../data';
import {
  amountIn,
  chargeBars,
  chargesIn,
  chargesTotal,
  firstWeekday,
  flagsOf,
  increaseOf,
  monthSummary,
  monthlyTotal,
  nextCharge,
  yearly,
} from '../subscriptions';

const plain = (text: string) => text.replace(/ /g, ' ');
const money = (value: number) => plain(formatCents(value));
const byId = (id: string) => SUBSCRIPTIONS.find((item) => item.id === id)!;
const TODAY = '2026-09-23';

describe('subscriptions', () => {
  it('sums the month and the year', () => {
    expect(money(monthlyTotal(SUBSCRIPTIONS))).toBe('R$ 101,60');
    expect(money(yearly(monthlyTotal(SUBSCRIPTIONS)))).toBe('R$ 1.219,20');
    expect(money(yearly(byId('prime').amount))).toBe('R$ 238,80');
  });

  it('finds the next charge and the price of each month', () => {
    expect(nextCharge(byId('netflix'), TODAY)).toBe('2026-10-08');
    expect(nextCharge(byId('netflix'), '2026-10-05')).toBe('2026-10-08');
    expect(nextCharge(byId('spotify'), '2026-10-02')).toBe('2026-11-02');
    expect(money(amountIn(byId('netflix'), '2026-09'))).toBe('R$ 39,90');
    expect(money(amountIn(byId('netflix'), '2026-10'))).toBe('R$ 44,90');
  });

  it('describes the Netflix increase', () => {
    const increase = increaseOf(byId('netflix'))!;
    expect(money(increase.monthly)).toBe('R$ 5,00');
    expect(increase.percent).toBeCloseTo(12.53, 2);
    expect(money(increase.yearly)).toBe('R$ 60,00');
    expect(flagsOf(byId('netflix')).map((flag) => plain(flag.label))).toEqual([
      'Subiu de R$ 39,90',
    ]);
    expect(flagsOf(byId('prime'))[0]?.label).toBe('Sem uso aparente há 60 dias');
    expect(money(chargesTotal(byId('netflix')))).toBe('R$ 239,40');
    expect(chargeBars(byId('netflix'), TODAY).map((bar) => bar.label)).toEqual([
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out*',
    ]);
  });

  it('lays out October and sums it up like the design', () => {
    expect(firstWeekday('2026-10')).toBe(4);
    expect(plain(monthSummary(chargesIn(SUBSCRIPTIONS, '2026-10'))!)).toBe(
      'Todas vencem até o dia 15: R$ 66,80 até o dia 8 (Spotify e Netflix) e R$ 34,80 entre os dias 12 e 15 (Amazon Prime e iCloud+). Nenhuma na segunda quinzena.',
    );
    expect(monthSummary([])).toBeNull();
  });
});
