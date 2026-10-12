import { cents, formatCents } from '@guara/utils';

import { BUDGETS, CATEGORY_HISTORY } from '../../data';
import { budgetView } from '../../hooks/useBudgets';
import {
  budgetLine,
  budgetStatus,
  budgetTotals,
  capSuggestion,
  detailParts,
  historyBars,
  monthsOverCap,
  noticeDetail,
  noticeRows,
  threeMonthAverage,
} from '../budgets';

const plain = (text: string) => text.replace(/ /g, ' ');
const views = BUDGETS.map((item) => budgetView(item, () => 0));
const [food, transport, leisure] = views as [
  (typeof views)[0],
  (typeof views)[0],
  (typeof views)[0],
];

describe('caps of the month', () => {
  it('derives status and totals from spent and cap', () => {
    expect(views.map((view) => view.status)).toEqual(['warning', 'warning', 'ok']);
    expect(budgetStatus(cents(100_001), cents(100_000))).toBe('exceeded');
    expect(budgetStatus(cents(69_999), cents(100_000))).toBe('ok');
    const totals = budgetTotals(views);
    expect(plain(formatCents(totals.spent))).toBe('R$ 1.248,58');
    expect(plain(formatCents(totals.limit))).toBe('R$ 1.850,00');
    expect(totals.percent).toBe(67);
  });

  it('writes the line under each bar like the design', () => {
    expect(plain(budgetLine(food))).toBe('74% · No ritmo atual, fecha perto de R$ 960');
    expect(plain(budgetLine(transport))).toBe(
      '86% · Faltam R$ 63,60 · no ritmo atual, passa do teto',
    );
    expect(plain(budgetLine(leisure))).toBe('30% · Faltam R$ 280,00');
    const over = budgetView(BUDGETS[0]!, () => 30_000);
    expect(plain(budgetLine(over))).toBe('104% · Passou R$ 42,18 do teto');
  });

  it('splits the detail caption', () => {
    const parts = detailParts(food);
    expect(parts.percent).toBe('74%');
    expect(plain(parts.remaining.value)).toBe('R$ 257,82');
    expect(parts.pace?.text).toBe('no ritmo atual, fecha perto de');
    expect(plain(parts.pace?.value ?? '')).toBe('R$ 960');
  });

  it('lists each warning with the notice sent this month', () => {
    const rows = noticeRows(food);
    expect(rows.map((row) => plain(row.label))).toEqual([
      'R$ 500 · 1º de 3 avisos',
      'R$ 700 · 2º de 3 avisos',
      'R$ 1.000 · teto',
    ]);
    expect(noticeDetail(rows[0]!.notice!)).toBe('12/09/2026, 13:48 · celular');
    expect(rows[1]!.notice && noticeDetail(rows[1]!.notice)).toBe('21/09/2026, 19:02 · celular');
    expect(rows[2]!.notice).toBeNull();
  });
});

describe('history of a category', () => {
  const history = CATEGORY_HISTORY.food!;

  it('averages the last 3 closed months and finds the months over the cap', () => {
    expect(plain(formatCents(threeMonthAverage(history)))).toBe('R$ 910,00');
    expect(monthsOverCap(history, cents(100_000))).toEqual(['2026-07']);
    expect(historyBars(history).map((bar) => `${bar.label} ${bar.value}`)).toEqual([
      'abr 790',
      'mai 860',
      'jun 880',
      'jul 1020',
      'ago 830',
      'set* 742',
    ]);
  });

  it('suggests a round cap above the average (Tamanduá)', () => {
    const suggestion = capSuggestion(history);
    expect(suggestion?.limit).toBe(100_000);
    expect(suggestion?.monthsOver).toEqual(['2026-07']);
    expect(capSuggestion(history.slice(-2))).toBeNull();
  });
});
