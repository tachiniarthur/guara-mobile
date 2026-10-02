import type { ApiBody } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { reportKeys } from './keys';

/** Requests an export; follow it with `useReportExport(result.id)`. */
export function useCreateReportExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'reports.createExport'>) =>
      apiRequest('reports.createExport', { body }),
    onSuccess: (created) => queryClient.setQueryData(reportKeys.export(created.id), created),
  });
}
