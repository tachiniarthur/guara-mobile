import type { ApiBody } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

/** Properties count towards net worth. */
const AFFECTED = [QUERY_ROOTS.properties, QUERY_ROOTS.wealth];

export function useCreateRealEstate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'properties.createRealEstate'>) =>
      apiRequest('properties.createRealEstate', { body }),
    onSuccess: () => invalidateRoots(queryClient, AFFECTED),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'properties.createVehicle'>) =>
      apiRequest('properties.createVehicle', { body }),
    onSuccess: () => invalidateRoots(queryClient, AFFECTED),
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => apiRequest('properties.delete', { params: { propertyId } }),
    onSuccess: () => invalidateRoots(queryClient, AFFECTED),
  });
}
