import { addCents } from '@guara/utils';

import { PORTFOLIO } from '../data';
import { propertiesTotal } from '../lib/properties';
import { useInvestmentsStore } from '../store';

/**
 * Real estate and vehicles, with the net worth (investments + properties). Static data today;
 * a TanStack query when the API exists (same shape).
 */
export function useProperties() {
  const properties = useInvestmentsStore((state) => state.properties);
  const total = propertiesTotal(properties);
  return {
    properties,
    total,
    investments: PORTFOLIO.total,
    netWorth: addCents(PORTFOLIO.total, total),
    find: (id: string | undefined) => properties.find((property) => property.id === id) ?? null,
  };
}
