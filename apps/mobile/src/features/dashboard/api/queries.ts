import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { dashboardKeys } from './keys';

/** Home dashboard of the current month. */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: ({ signal }) => apiRequest('dashboard.get', { signal }),
  });
}
