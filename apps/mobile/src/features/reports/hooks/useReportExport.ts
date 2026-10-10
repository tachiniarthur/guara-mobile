import type { ExportFormat } from '@guara/types';
import { formatDate, joinList } from '@guara/utils';

import { useBankConnectionsStore } from '@/features/bank-connections';
// Straight to the modules: Gastos uses the export menu too, and its index would import back.
import { categoryLabel } from '@/features/spending/categories';
import { useLedger } from '@/features/spending/hooks/useLedger';
import { rowDetail } from '@/features/spending/lib/format';
import { displayName, signedAmount } from '@/features/spending/lib/ledger';
import { saveFile, savePdf, type SavedFile } from '@/lib/share';
import { buildCsv, buildXlsx } from '@/lib/spreadsheet';

import { COMPARISON, REPORT, SPLIT } from '../data';
import {
  exportFileName,
  exportFormat,
  reportHtml,
  summaryRows,
  transactionRows,
  type ExportTransaction,
  type ReportExportData,
} from '../lib/export';

/**
 * "Exportar relatório": what goes into the file (period, banks and lançamentos of the report)
 * and the file itself. Generated on the phone today; `reports.createExport` when the API exists.
 */
export function useReportExport() {
  const ledger = useLedger();
  const banks = useBankConnectionsStore((state) => state.connections);

  const transactions: ExportTransaction[] = ledger.transactions
    .filter((tx) => !tx.markedDuplicate && !tx.hiddenFromReports)
    .map((tx) => ({
      date: formatDate(tx.date),
      description: displayName(tx),
      category: categoryLabel(tx.categoryId),
      account: rowDetail(tx, ledger.accounts[tx.accountId], {
        showTime: false,
        showCategory: false,
      }),
      amount: signedAmount(tx),
    }));

  const data: ReportExportData = {
    title: REPORT.title,
    periodLabel: REPORT.periodLabel,
    banksLabel: joinList(banks.map((bank) => bank.name)),
    totals: REPORT.totals,
    split: SPLIT,
    comparison: COMPARISON,
    transactions,
  };

  const generate = async (format: ExportFormat): Promise<SavedFile> => {
    const name = exportFileName(ledger.month, format);
    const { mimeType } = exportFormat(format);
    switch (format) {
      case 'pdf':
        return savePdf(reportHtml(data), name);
      case 'xlsx':
        return saveFile(
          name,
          {
            bytes: buildXlsx([
              { name: 'Resumo', rows: summaryRows(data) },
              { name: 'Lançamentos', rows: transactionRows(transactions) },
            ]),
          },
          mimeType,
        );
      case 'csv':
        // BOM: Excel opens the accents right.
        return saveFile(name, { text: `﻿${buildCsv(transactionRows(transactions))}` }, mimeType);
    }
  };

  return { data, generate };
}
