import type { AssetClass, AssetType, EvolutionRange, PriceRange } from '@guara/types';

import { QUERY_ROOTS } from '@/constants/query-keys';

export const investmentKeys = {
  wealth: [QUERY_ROOTS.wealth, 'overview'] as const,
  evolution: (range: EvolutionRange) => [QUERY_ROOTS.wealth, 'evolution', range] as const,
  positions: (assetClass?: AssetClass) => [QUERY_ROOTS.positions, assetClass ?? 'all'] as const,
  allocation: [QUERY_ROOTS.allocation] as const,
  exposure: [QUERY_ROOTS.exposure] as const,
  duplicates: () => [QUERY_ROOTS.duplicates, 'list'] as const,
  duplicate: (duplicateId: string) => [QUERY_ROOTS.duplicates, 'detail', duplicateId] as const,
  asset: (ticker: string) => [QUERY_ROOTS.assets, 'detail', ticker] as const,
  history: (ticker: string, range: PriceRange) =>
    [QUERY_ROOTS.assets, 'history', ticker, range] as const,
  search: (query: string, type?: AssetType) =>
    [QUERY_ROOTS.assets, 'search', query, type ?? 'all'] as const,
};
