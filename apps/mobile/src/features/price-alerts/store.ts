import { create } from 'zustand';

import { PRICE_ALERTS, type PriceAlertItem } from './data';

interface PriceAlertsState {
  alerts: PriceAlertItem[];
  /** Creates an alert and returns its id. */
  add: (alert: Omit<PriceAlertItem, 'id'>) => string;
  update: (id: string, patch: Partial<Omit<PriceAlertItem, 'id' | 'ticker'>>) => void;
  /** "Cancelar alerta": the Guará stops watching this target. */
  cancel: (id: string) => void;
  reset: () => void;
}

/**
 * Price alerts with what the user changed in the app. Local until the API exists; then each
 * action becomes a mutation (`priceAlerts.create`, `priceAlerts.update`, `priceAlerts.cancel`).
 */
export const usePriceAlertsStore = create<PriceAlertsState>()((set) => ({
  alerts: PRICE_ALERTS,
  add: (alert) => {
    const id = `alert-${alert.ticker.toLowerCase()}-${Date.now()}`;
    set(({ alerts }) => ({ alerts: [...alerts, { ...alert, id }] }));
    return id;
  },
  update: (id, patch) =>
    set(({ alerts }) => ({
      alerts: alerts.map((alert) => (alert.id === id ? { ...alert, ...patch } : alert)),
    })),
  cancel: (id) => set(({ alerts }) => ({ alerts: alerts.filter((alert) => alert.id !== id) })),
  reset: () => set({ alerts: PRICE_ALERTS }),
}));
