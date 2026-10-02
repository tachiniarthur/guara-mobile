import type { AssetClass, AssetType, EvolutionRange, PriceRange } from '@guara/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import { STALE_TIME } from '@/lib/query-client';

import { investmentKeys } from './keys';

export function useWealthOverview() {
  return useQuery({
    queryKey: investmentKeys.wealth,
    queryFn: ({ signal }) => apiRequest('wealth.overview', { signal }),
  });
}

export function useWealthEvolution(range: EvolutionRange) {
  return useQuery({
    queryKey: investmentKeys.evolution(range),
    queryFn: ({ signal }) => apiRequest('wealth.evolution', { query: { range }, signal }),
    staleTime: STALE_TIME.analytics,
    placeholderData: keepPreviousData,
  });
}

export function usePositions(assetClass?: AssetClass) {
  return useQuery({
    queryKey: investmentKeys.positions(assetClass),
    queryFn: ({ signal }) => apiRequest('positions.list', { query: { class: assetClass }, signal }),
  });
}

export function useAllocation() {
  return useQuery({
    queryKey: investmentKeys.allocation,
    queryFn: ({ signal }) => apiRequest('allocation.get', { signal }),
    staleTime: STALE_TIME.analytics,
  });
}

export function useExposure() {
  return useQuery({
    queryKey: investmentKeys.exposure,
    queryFn: ({ signal }) => apiRequest('exposure.get', { signal }),
    staleTime: STALE_TIME.analytics,
  });
}

export function usePositionDuplicates() {
  return useQuery({
    queryKey: investmentKeys.duplicates(),
    queryFn: ({ signal }) => apiRequest('duplicates.list', { signal }),
  });
}

export function usePositionDuplicate(duplicateId: string) {
  return useQuery({
    queryKey: investmentKeys.duplicate(duplicateId),
    queryFn: ({ signal }) => apiRequest('duplicates.get', { params: { duplicateId }, signal }),
  });
}

/** Quote, indicators, dividends and what the user received. */
export function useAsset(ticker: string) {
  return useQuery({
    queryKey: investmentKeys.asset(ticker),
    queryFn: ({ signal }) => apiRequest('assets.get', { params: { ticker }, signal }),
    staleTime: STALE_TIME.quotes,
  });
}

export function useAssetHistory(ticker: string, range: PriceRange) {
  return useQuery({
    queryKey: investmentKeys.history(ticker, range),
    queryFn: ({ signal }) =>
      apiRequest('assets.history', { params: { ticker }, query: { range }, signal }),
    staleTime: STALE_TIME.quotes,
    placeholderData: keepPreviousData,
  });
}

/** Searches by ticker or name; disabled below 2 characters. */
export function useAssetSearch(query: string, type?: AssetType) {
  const text = query.trim();
  return useQuery({
    queryKey: investmentKeys.search(text, type),
    queryFn: ({ signal }) => apiRequest('assets.search', { query: { q: text, type }, signal }),
    enabled: text.length >= 2,
    staleTime: STALE_TIME.quotes,
    placeholderData: keepPreviousData,
  });
}
