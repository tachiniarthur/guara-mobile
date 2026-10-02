import { z } from 'zod';

import {
  CreateReportExportBodySchema,
  DashboardSchema,
  ReportExportIdSchema,
  ReportExportSchema,
  ReportQuerySchema,
  ReportSummarySchema,
} from '../../domain';
import { defineEndpoints } from '../define';

/** Home dashboard and reports. */
export const overviewEndpoints = defineEndpoints({
  'dashboard.get': {
    method: 'GET',
    path: '/v1/dashboard',
    summary: 'Home dashboard of the current month',
    response: DashboardSchema,
  },
  'reports.summary': {
    method: 'GET',
    path: '/v1/reports/summary',
    summary: 'Income × expenses, balance over time and comparison with the previous period',
    query: ReportQuerySchema,
    response: ReportSummarySchema,
  },
  'reports.createExport': {
    method: 'POST',
    path: '/v1/reports/exports',
    summary: 'Request a PDF/XLSX/CSV export (download or e-mail)',
    body: CreateReportExportBodySchema,
    response: ReportExportSchema,
  },
  'reports.getExport': {
    method: 'GET',
    path: '/v1/reports/exports/:exportId',
    summary: 'Status of an export',
    params: z.object({ exportId: ReportExportIdSchema }),
    response: ReportExportSchema,
  },
});
