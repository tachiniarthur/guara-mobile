import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { propertyKeys } from './keys';

export function useProperties() {
  return useQuery({
    queryKey: propertyKeys.list(),
    queryFn: ({ signal }) => apiRequest('properties.list', { signal }),
  });
}

export function useProperty(propertyId: string) {
  return useQuery({
    queryKey: propertyKeys.detail(propertyId),
    queryFn: ({ signal }) => apiRequest('properties.get', { params: { propertyId }, signal }),
  });
}
