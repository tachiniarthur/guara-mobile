import { create } from 'zustand';

import type { RiskLevel } from '../data';

interface InvestmentsState {
  /** Risk chosen by the user, by position id (overrides the asset's registered risk). */
  riskOverrides: Record<string, RiskLevel>;
  setRisk: (positionId: string, risk: RiskLevel) => void;
  reset: () => void;
}

/**
 * What the user changed in Investimentos. Local until the API exists; then `setRisk` becomes
 * a mutation on the position.
 */
export const useInvestmentsStore = create<InvestmentsState>()((set) => ({
  riskOverrides: {},
  setRisk: (positionId, risk) =>
    set(({ riskOverrides }) => ({ riskOverrides: { ...riskOverrides, [positionId]: risk } })),
  reset: () => set({ riskOverrides: {} }),
}));
