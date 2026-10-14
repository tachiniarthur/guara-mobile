import { cents } from '@guara/utils';

import { BUDGETS } from '@/features/budgets/data';

import {
  CATEGORY_DETAILS,
  CATEGORY_TOTALS,
  LEDGER,
  LEDGER_ACCOUNTS,
  SPENDING,
  SPENDING_TODAY,
  TRANSACTION_SUMMARIES,
} from '../../data';
import {
  budgetCaption,
  budgetNote,
  budgetStateText,
  categoryInsight,
  dayLabel,
  detailRows,
  noResultsMessage,
  rowDetail,
  shortDayLabel,
  staleBanksMessage,
  unusualMessage,
} from '../format';
import {
  NO_EDITS,
  adjustSummary,
  applyEdits,
  budgetsWithEdits,
  categorySummary,
  filterLedger,
  groupByDay,
  monthBudgets,
  type LedgerEdits,
  type LedgerFilters,
} from '../ledger';

const ALL: LedgerFilters = {
  query: '',
  bank: 'all',
  categoryId: 'all',
  direction: 'all',
  month: '2026-09',
};

const byId = (id: string) => LEDGER.find((tx) => tx.id === id)!;
// Gastos shows the caps of categories with spending this month (Lazer has none yet).
const MONTH_BUDGETS = monthBudgets(BUDGETS, CATEGORY_TOTALS);

function summaryOf(edits: LedgerEdits = NO_EDITS) {
  return categorySummary('food', {
    month: '2026-09',
    totals: CATEGORY_TOTALS,
    budgets: MONTH_BUDGETS,
    details: CATEGORY_DETAILS,
    totalOut: SPENDING.totalOut,
    ledger: LEDGER,
    edits,
  })!;
}

describe('ledger', () => {
  it('groups by day with the signed total of each day (design values)', () => {
    const days = groupByDay(filterLedger(LEDGER, ALL, LEDGER_ACCOUNTS));
    expect(days.map((day) => [day.date, day.total])).toEqual([
      ['2026-09-23', -125_940],
      ['2026-09-22', -51_300],
      ['2026-09-21', -16_610],
      ['2026-09-20', -19_840],
      ['2026-09-19', -15_462],
      ['2026-09-18', 90_770],
      ['2026-09-10', -31_120],
    ]);
  });

  it('filters by bank, category, direction and text (accents ignored)', () => {
    const names = (filters: Partial<LedgerFilters>) =>
      filterLedger(LEDGER, { ...ALL, ...filters }, LEDGER_ACCOUNTS).map((tx) => tx.description);
    expect(names({ query: 'japones' })).toEqual(['Delivery japonês']);
    expect(names({ query: 'restaurantes' })).toHaveLength(4);
    expect(names({ direction: 'in' })).toEqual(['Freela · site institucional']);
    expect(names({ bank: 'itau', categoryId: 'food' })).toEqual([
      'Padaria Central',
      'Mercado do bairro',
      'Mercado do mês',
    ]);
    expect(names({ query: 'academia', bank: 'nubank' })).toEqual([]);
    expect(names({ month: '2026-08' })).toEqual([]);
  });

  it('recategorising for the merchant moves every purchase of the store and the caps', () => {
    const app = byId('tx-app');
    const edits: LedgerEdits = {
      ...NO_EDITS,
      categories: { [app.id]: 'leisure' },
      merchantRules: { 'transporte por app': 'leisure' },
    };
    const moved = LEDGER.map((tx) => applyEdits(tx, edits)).filter(
      (tx) => tx.description === 'Transporte por app',
    );
    expect(
      moved.every((tx) => tx.categoryId === 'leisure' && tx.userCategoryId === 'leisure'),
    ).toBe(true);
    const transport = budgetsWithEdits(MONTH_BUDGETS, LEDGER, edits).find(
      (budget) => budget.categoryId === 'transport',
    )!;
    // 386,40 − (23,90 + 37,20 + 36,30)
    expect(transport.spent).toBe(38_640 - 9_740);
  });

  it('a recategorised purchase leaves its subcategory and the category summary', () => {
    const edits: LedgerEdits = { ...NO_EDITS, categories: { 'tx-pizza': 'leisure' } };
    expect(applyEdits(byId('tx-pizza'), edits).subcategoryId).toBeNull();
    const summary = summaryOf(edits);
    expect(summary.spent).toBe(74_218 - 7_290);
    expect(summary.count).toBe(30);
    expect(summary.subcategories[0]).toMatchObject({
      subcategoryId: 'restaurants',
      spent: 39_852 - 7_290,
      count: 13,
    });
  });

  it('duplicates leave the day totals and the month header', () => {
    const edits: LedgerEdits = { ...NO_EDITS, duplicates: { 'tx-cafe': true } };
    const ledger = LEDGER.map((tx) => applyEdits(tx, edits));
    expect(groupByDay(ledger)[0]!.total).toBe(-124_990);
    expect(adjustSummary(TRANSACTION_SUMMARIES.all, LEDGER, edits)!.totalOut).toBe(591_247 - 950);
    expect(adjustSummary(TRANSACTION_SUMMARIES.nubank, LEDGER, edits)).toBeNull();
  });

  it('builds the category header from the month figures', () => {
    const summary = summaryOf();
    expect(summary).toMatchObject({ spent: 74_218, count: 31 });
    expect(Math.round(summary.shareOfOutflows)).toBe(13);
    expect(Math.round(summary.changePercent!)).toBe(12);
    expect(summary.budget).toMatchObject({
      limit: 100_000,
      status: 'warning',
      warningsSent: [50_000, 70_000],
    });
    expect(summary.subcategories.map((item) => item.share)).toEqual([53.7, 36.58, 9.72]);
    expect(budgetStateText(summary.budget!.usedPercent)).toBe('74% · atenção');
    expect(budgetCaption(summary.budget!)).toBe(
      'Avisos de R$ 500 e R$ 700 já enviados · no ritmo atual, fecha perto de R$ 960',
    );
  });

  it('categories without month figures have no header', () => {
    expect(
      categorySummary('leisure', {
        month: '2026-09',
        totals: CATEGORY_TOTALS,
        budgets: MONTH_BUDGETS,
        details: CATEGORY_DETAILS,
        totalOut: SPENDING.totalOut,
        ledger: LEDGER,
        edits: NO_EDITS,
      }),
    ).toBeNull();
  });
});

describe('ledger texts', () => {
  // The design shows 2025 weekdays (21/09 as Sunday); the app follows the real 2026 calendar.
  it('labels days relative to the design snapshot', () => {
    expect(dayLabel('2026-09-23', SPENDING_TODAY)).toBe('Hoje · 23 de setembro');
    expect(dayLabel('2026-09-22', SPENDING_TODAY)).toBe('Ontem · 22 de setembro');
    expect(dayLabel('2026-09-21', SPENDING_TODAY)).toBe('Segunda · 21 de setembro');
    expect(dayLabel('2026-09-19', SPENDING_TODAY)).toBe('Sábado · 19 de setembro');
    expect(shortDayLabel(byId('tx-eletronicos'), SPENDING_TODAY)).toBe('Hoje, 02:14');
    expect(shortDayLabel(byId('tx-freela'), SPENDING_TODAY)).toBe('18 set');
  });

  it('describes the account and the time of today’s rows', () => {
    const account = (id: string) => LEDGER_ACCOUNTS[byId(id).accountId];
    expect(
      rowDetail(byId('tx-eletronicos'), account('tx-eletronicos'), {
        showTime: true,
        showCategory: true,
      }),
    ).toBe('02:14 · Nubank crédito · Eletrônicos');
    expect(
      rowDetail(byId('tx-freela'), account('tx-freela'), { showTime: false, showCategory: true }),
    ).toBe('Pix recebido · Itaú · Entrada');
    expect(
      rowDetail(byId('tx-padaria'), account('tx-padaria'), {
        showTime: false,
        showCategory: false,
      }),
    ).toBe('Itaú débito');
  });

  it('lists the detail fields of the design', () => {
    const tx = byId('tx-eletronicos');
    expect(detailRows(tx, LEDGER_ACCOUNTS[tx.accountId])).toEqual([
      { label: 'Data', value: 'Quarta, 23/09/2026 · 02:14' },
      { label: 'Conta ou cartão', value: 'Nubank · cartão de crédito' },
      { label: 'Fatura', value: 'Outubro · vence em 10/10' },
      { label: 'Forma', value: 'À vista' },
      { label: 'Descrição no banco', value: 'LOJAELETRON*ONLINE SP' },
      { label: 'Origem', value: 'Open Finance · Nubank' },
    ]);
  });

  it('writes the assistants’ notes from the data', () => {
    expect(categoryInsight(summaryOf(), LEDGER)).toBe(
      'Restaurantes e delivery de sábado puxaram o aumento: R$\u00A0154,62 este mês.',
    );
    expect(unusualMessage(byId('tx-eletronicos'), ['unusual_amount', 'unusual_time'])).toBe(
      'Compra às 02:14, bem acima do seu costume em eletrônicos. Foi você?',
    );
    expect(budgetNote(byId('tx-eletronicos'), MONTH_BUDGETS)).toBe(
      'Esta compra não entra em nenhum teto. Você não tem teto para Eletrônicos.',
    );
    expect(budgetNote(byId('tx-cafe'), MONTH_BUDGETS)).toBe(
      'Esta compra entra no teto de Alimentação: R$ 742 de R$ 1.000 (74% · atenção).',
    );
    expect(budgetNote(byId('tx-freela'), MONTH_BUDGETS)).toBeNull();
  });

  it('explains empty results and stale banks', () => {
    expect(noResultsMessage({ ...ALL, query: 'academia', bank: 'nubank' })).toBe(
      'Nenhum lançamento com “academia” no Nubank em setembro.',
    );
    expect(
      staleBanksMessage([
        { bank: 'nubank', staleSince: null },
        { bank: 'itau', staleSince: '2026-09-23T13:05:00.000Z' },
      ]),
    ).toBe('O Itaú não atualizou desde 10:05. Os lançamentos do Nubank estão em dia.');
    expect(staleBanksMessage([{ bank: 'nubank', staleSince: null }])).toBeNull();
  });

  it('a passed cap reads "passou"', () => {
    expect(budgetStateText((cents(105_000) / cents(100_000)) * 100)).toBe('105% · passou');
  });
});
