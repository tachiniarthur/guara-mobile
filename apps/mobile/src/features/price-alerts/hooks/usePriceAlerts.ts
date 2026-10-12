import { QUOTES, type AssetQuote, type PriceAlertItem } from '../data';
import { usePriceAlertsStore } from '../store';

export interface PriceAlertView extends PriceAlertItem {
  quote: AssetQuote;
}

/** Price alerts with the quote of each asset. Static data today; `priceAlerts.list` later. */
export function usePriceAlerts() {
  const items = usePriceAlertsStore((state) => state.alerts);
  const alerts: PriceAlertView[] = items.flatMap((item) => {
    const quote = QUOTES[item.ticker];
    return quote ? [{ ...item, quote }] : [];
  });
  return { alerts };
}
