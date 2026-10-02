import { QUERY_ROOTS } from '@/constants/query-keys';

export const priceAlertKeys = {
  all: [QUERY_ROOTS.priceAlerts] as const,
  list: () => [...priceAlertKeys.all, 'list'] as const,
  detail: (alertId: string) => [...priceAlertKeys.all, 'detail', alertId] as const,
};
