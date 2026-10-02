import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import { STALE_TIME } from '@/lib/query-client';

import { reportKeys, type ReportFilters } from './keys';

const EXPORT_POLL_MS = 2_000;

export function useReportSummary(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: reportKeys.summary(filters),
    queryFn: ({ signal }) => apiRequest('reports.summary', { query: filters, signal }),
    staleTime: STALE_TIME.analytics,
  });
}

/** Status of an export; polls while it is queued or processing. */
export function useReportExport(exportId: string | null) {
  return useQuery({
    queryKey: reportKeys.export(exportId ?? ''),
    queryFn: ({ signal }) =>
      apiRequest('reports.getExport', { params: { exportId: exportId! }, signal }),
    enabled: exportId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'queued' || status === 'processing' ? EXPORT_POLL_MS : false;
    },
  });
}
