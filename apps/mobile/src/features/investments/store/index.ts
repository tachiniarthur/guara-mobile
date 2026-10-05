import type { Cents, YearMonth } from '@guara/types';
import { create } from 'zustand';

import type { RiskLevel } from '../data';
import { PROPERTIES, type Financing, type Property } from '../property-data';

interface InvestmentsState {
  /** Risk chosen by the user, by position id (overrides the asset's registered risk). */
  riskOverrides: Record<string, RiskLevel>;
  setRisk: (positionId: string, risk: RiskLevel) => void;
  /** Real estate and vehicles of the net worth. */
  properties: Property[];
  /** Adds a property and returns its id. */
  addProperty: (property: Omit<Property, 'id'>) => string;
  /** Replaces a property (edit form). */
  updateProperty: (property: Property) => void;
  /** New estimate of a real estate ("Atualizar valor"); replaces one of the same month. */
  addValuation: (id: string, value: Cents, on: YearMonth) => void;
  /** New debt balance ("Atualizar saldo"); `null` marks the asset as paid off. */
  setFinancing: (id: string, financing: Financing | null) => void;
  removeProperty: (id: string) => void;
  reset: () => void;
}

/**
 * What the user changed in Investimentos. Local until the API exists; then each action becomes
 * a mutation (risk of a position, `properties.*`).
 */
export const useInvestmentsStore = create<InvestmentsState>()((set) => ({
  riskOverrides: {},
  setRisk: (positionId, risk) =>
    set(({ riskOverrides }) => ({ riskOverrides: { ...riskOverrides, [positionId]: risk } })),
  properties: PROPERTIES,
  addProperty: (property) => {
    const id = `property-${Date.now()}`;
    set(({ properties }) => ({ properties: [...properties, { ...property, id } as Property] }));
    return id;
  },
  updateProperty: (property) =>
    set(({ properties }) => ({
      properties: properties.map((item) => (item.id === property.id ? property : item)),
    })),
  addValuation: (id, value, on) =>
    set(({ properties }) => ({
      properties: properties.map((item) =>
        item.id === id && item.kind === 'realEstate'
          ? {
              ...item,
              valuations: [
                { on, value, kind: 'estimate' as const },
                ...item.valuations.filter((valuation) => valuation.on !== on),
              ].sort((a, b) => b.on.localeCompare(a.on)),
            }
          : item,
      ),
    })),
  setFinancing: (id, financing) =>
    set(({ properties }) => ({
      properties: properties.map((item) => (item.id === id ? { ...item, financing } : item)),
    })),
  removeProperty: (id) =>
    set(({ properties }) => ({ properties: properties.filter((item) => item.id !== id) })),
  reset: () => set({ riskOverrides: {}, properties: PROPERTIES }),
}));
