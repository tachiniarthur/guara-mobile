import { ASSETS } from '../assets';
import { PORTFOLIO, POSITIONS, QUOTES } from '../data';
import { useInvestmentsStore } from '../store';

/** `empty`: nothing connected or registered yet; `error`: the positions could not be loaded. */
export type PositionsStatus = 'ready' | 'empty' | 'error';

/** "Cotações desatualizadas: a Brapi não respondeu às 14:30. Mostrando valores das 13:45." */
export function staleQuotesMessage(quotes: typeof QUOTES): string | null {
  if (!quotes.fallbackTime) return null;
  return `Cotações desatualizadas: a Brapi não respondeu às ${quotes.time}. Mostrando valores das ${quotes.fallbackTime}.`;
}

/**
 * Positions of the portfolio with the quote status. Static data today; a TanStack query when
 * the API exists (same shape).
 */
export function usePositions() {
  const riskOverrides = useInvestmentsStore((state) => state.riskOverrides);
  const setRisk = useInvestmentsStore((state) => state.setRisk);
  // Widened on purpose: the API also answers with `error`.
  const status = (POSITIONS.length === 0 ? 'empty' : 'ready') as PositionsStatus;
  const positions = POSITIONS.map((position) => {
    const risk = riskOverrides[position.id];
    return risk ? { ...position, risk } : position;
  });
  return {
    status,
    positions,
    setRisk,
    total: PORTFOLIO.total,
    quotesTime: QUOTES.time,
    staleMessage: staleQuotesMessage(QUOTES),
    /** Whether the asset has its own page (the others show a toast). */
    hasAssetPage: (ticker: string) => ticker in ASSETS,
    /** Reloads the positions (the API's refetch; nothing to do with static data). */
    refetch: () => undefined,
  };
}

export type PositionsData = ReturnType<typeof usePositions>;
