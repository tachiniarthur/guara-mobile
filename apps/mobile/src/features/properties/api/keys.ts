import { QUERY_ROOTS } from '@/constants/query-keys';

export const propertyKeys = {
  all: [QUERY_ROOTS.properties] as const,
  list: () => [...propertyKeys.all, 'list'] as const,
  detail: (propertyId: string) => [...propertyKeys.all, 'detail', propertyId] as const,
};
