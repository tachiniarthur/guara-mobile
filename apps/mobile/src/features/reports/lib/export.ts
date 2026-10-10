import type { Cents, ExportFormat, YearMonth } from '@guara/types';
import { formatCents, formatDate } from '@guara/utils';

import type { SheetCell } from '@/lib/spreadsheet';

/** Formats of "Exportar relatório", in the design's order. */
export const EXPORT_FORMATS: {
  value: ExportFormat;
  label: string;
  description: string;
  /** "PDF · 1 a 23 de setembro". */
  short: string;
  mimeType: string;
}[] = [
  {
    value: 'pdf',
    label: 'PDF',
    description: 'O relatório como está na tela, com gráficos',
    short: 'PDF',
    mimeType: 'application/pdf',
  },
  {
    value: 'xlsx',
    label: 'Planilha Excel (.xlsx)',
    description: 'Resumo e todos os lançamentos do período',
    short: 'Excel',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    value: 'csv',
    label: 'CSV',
    description: 'Lançamentos em texto, para outras ferramentas',
    short: 'CSV',
    mimeType: 'text/csv',
  },
];

export const exportFormat = (value: ExportFormat) =>
  EXPORT_FORMATS.find((format) => format.value === value) ?? EXPORT_FORMATS[0]!;

/** "guara-relatorio-setembro-2026.pdf". */
export function exportFileName(month: YearMonth, format: ExportFormat): string {
  return `guara-relatorio-${formatDate(`${month}-01`, 'MMMM-yyyy')}.${format}`;
}

/** One lançamento of the exported period. */
export interface ExportTransaction {
  date: string;
  description: string;
  category: string;
  account: string;
  /** Negative for money that went out. */
  amount: Cents;
}

export interface ReportExportData {
  title: string;
  periodLabel: string;
  banksLabel: string;
  totals: { in: Cents; out: Cents; left: Cents };
  split: readonly { label: string; share: number }[];
  comparison: readonly { category: string; detail: string; change: string }[];
  transactions: readonly ExportTransaction[];
}

export function transactionRows(transactions: readonly ExportTransaction[]): SheetCell[][] {
  return [
    ['Data', 'Descrição', 'Categoria', 'Conta', 'Valor (R$)'],
    ...transactions.map((tx) => [
      tx.date,
      tx.description,
      tx.category,
      tx.account,
      { cents: tx.amount },
    ]),
  ];
}

export function summaryRows(data: ReportExportData): SheetCell[][] {
  return [
    [data.title],
    ['Período', data.periodLabel],
    ['Bancos', data.banksLabel],
    [],
    ['Entrou (R$)', { cents: data.totals.in }],
    ['Saiu (R$)', { cents: data.totals.out }],
    ['Sobrou (R$)', { cents: data.totals.left }],
    [],
    ['Para onde foi', 'Parte das saídas (%)'],
    ...data.split.map((item) => [item.label, item.share]),
  ];
}

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Printable page of the report (the PDF): totals, where the money went and the lançamentos. */
export function reportHtml(data: ReportExportData): string {
  // Print palette (paper, not the app's dark theme).
  const split = data.split
    .map(
      (item) =>
        `<tr><td>${escape(item.label)}</td><td class="bar"><span style="width:${item.share}%"></span></td><td class="num">${item.share}%</td></tr>`,
    )
    .join('');
  const comparison = data.comparison
    .map(
      (row) =>
        `<tr><td>${escape(row.category)}</td><td>${escape(row.detail)}</td><td class="num">${escape(row.change)}</td></tr>`,
    )
    .join('');
  const transactions = data.transactions
    .map(
      (tx) =>
        `<tr><td>${escape(tx.date)}</td><td>${escape(tx.description)}</td><td>${escape(tx.category)}</td><td>${escape(tx.account)}</td><td class="num">${escape(formatCents(tx.amount))}</td></tr>`,
    )
    .join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
body{font-family:-apple-system,Roboto,sans-serif;color:#0B110E;padding:32px;line-height:1.45;font-size:12px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:24px 0 8px}small{color:#5E6E64}
.totals{display:flex;gap:12px;margin-top:16px}.totals div{flex:1;padding:12px;border-radius:12px;background:#F2EFE6}
.totals strong{display:block;font-size:16px}table{width:100%;border-collapse:collapse}
td{padding:6px 4px;border-bottom:1px solid #E2DED2;vertical-align:top}.num{text-align:right;white-space:nowrap}
.bar{width:45%}.bar span{display:block;height:8px;border-radius:4px;background:#F2C230}
</style></head><body>
<h1>${escape(data.title)}</h1><small>${escape(data.periodLabel)} · ${escape(data.banksLabel)} · exportado do Guará</small>
<div class="totals"><div>Entrou<strong>${formatCents(data.totals.in)}</strong></div><div>Saiu<strong>${formatCents(data.totals.out)}</strong></div><div>Sobrou<strong>${formatCents(data.totals.left)}</strong></div></div>
<h2>Para onde foi</h2><table>${split}</table>
<h2>Comparado com o mês anterior</h2><table>${comparison}</table>
<h2>Lançamentos</h2><table>${transactions}</table>
</body></html>`;
}
