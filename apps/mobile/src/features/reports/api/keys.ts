import type { ApiQuery } from '@guara/types';

import { QUERY_ROOTS } from '@/constants/query-keys';

export type ReportFilters = ApiQuery<'reports.summary'>;

export const reportKeys = {
  all: [QUERY_ROOTS.reports] as const,
  summary: (filters: ReportFilters = {}) => [...reportKeys.all, 'summary', filters] as const,
  export: (exportId: string) => [...reportKeys.all, 'export', exportId] as const,
};
