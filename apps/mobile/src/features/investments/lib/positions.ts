import type { Cents } from '@guara/types';
import { formatPercent, normalizeForSearch, sumCents } from '@guara/utils';

import { POSITION_CLASSES, type Position, type PositionClassKey } from '../data';

export type PositionGrouping = 'list' | 'byClass';

/** `manual` covers everything the user registered (by hand or through the chat). */
export type OriginFilter = 'all' | 'openFinance' | 'manual';

export type PositionSort = 'valueDesc' | 'valueAsc' | 'changeDesc' | 'name';

export const ORIGIN_FILTERS: { value: OriginFilter; label: string }[] = [
  { value: 'all', label: 'Todas as origens' },
  { value: 'openFinance', label: 'Open Finance' },
  { value: 'manual', label: 'Cadastro manual' },
];

export const POSITION_SORTS: { value: PositionSort; label: string }[] = [
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
  { value: 'changeDesc', label: 'Maior alta hoje' },
  { value: 'name', label: 'Nome (A a Z)' },
];

export interface PositionFilters {
  query: string;
  origin: OriginFilter;
}

/** Positions matching the search (name, code or description, accents ignored) and the origin. */
export function filterPositions(
  positions: readonly Position[],
  { query, origin }: PositionFilters,
): Position[] {
  const needle = normalizeForSearch(query);
  return positions.filter((position) => {
    if (origin === 'openFinance' && position.origin.kind !== 'openFinance') return false;
    if (origin === 'manual' && position.origin.kind === 'openFinance') return false;
    if (!needle) return true;
    return normalizeForSearch(
      `${position.name} ${position.ticker} ${position.listDetail} ${position.detail}`,
    ).includes(needle);
  });
}

export function sortPositions(positions: readonly Position[], sort: PositionSort): Position[] {
  return [...positions].sort((a, b) => {
    switch (sort) {
      case 'valueAsc':
        return a.value - b.value;
      case 'changeDesc':
        return b.change - a.change;
      case 'name':
        return a.name.localeCompare(b.name, 'pt-BR');
      default:
        return b.value - a.value;
    }
  });
}

export interface PositionClassGroup {
  key: PositionClassKey;
  label: string;
  total: Cents;
  /** Share of the whole portfolio (sum of the positions' shares). */
  share: number;
  positions: Position[];
}

/** Groups in the design's class order; classes without positions are left out. */
export function groupPositions(positions: readonly Position[]): PositionClassGroup[] {
  return POSITION_CLASSES.flatMap(({ key, label }) => {
    const items = positions.filter((position) => position.classKey === key);
    if (items.length === 0) return [];
    return [
      {
        key,
        label,
        total: sumCents(items.map((item) => item.value)),
        share: items.reduce((sum, item) => sum + item.share, 0),
        positions: items,
      },
    ];
  });
}

export interface PositionsPreview {
  shown: Position[];
  /** The positions left out, summed ("Outras 6 posições"); null when none. */
  others: { count: number; total: Cents; share: number } | null;
}

/** The biggest `count` positions of the Investimentos card, plus the sum of the rest. */
export function previewPositions(positions: readonly Position[], count: number): PositionsPreview {
  const sorted = sortPositions(positions, 'valueDesc');
  const rest = sorted.slice(count);
  return {
    shown: sorted.slice(0, count),
    others:
      rest.length === 0
        ? null
        : {
            count: rest.length,
            total: sumCents(rest.map((item) => item.value)),
            share: rest.reduce((sum, item) => sum + item.share, 0),
          },
  };
}

/** A B3 code ("ITSA4", "HGLG11"), upper-cased, or null. Used to offer "Adicionar ITSA4". */
export function tickerFromQuery(query: string): string | null {
  const code = query.trim().toUpperCase();
  return /^[A-Z]{4}\d{1,2}$/.test(code) ? code : null;
}

/** "+0,52%" / "−0,74%": day change with two places and the typographic minus. */
export function changeText(change: number): string {
  return formatPercent(change, { signDisplay: 'always', typographicMinus: true });
}

/** "46,0%": share with one place, as in the design. */
export function shareText(share: number): string {
  return formatPercent(share, { fractionDigits: 1 });
}

/** "1 posição" / "6 posições". */
export function positionsCountText(count: number): string {
  return count === 1 ? '1 posição' : `${count} posições`;
}
