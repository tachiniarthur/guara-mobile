import type { Cents, InvestorProfileType } from '@guara/types';
import {
  formatCents,
  formatPercent,
  joinList,
  multiplyCents,
  subtractCents,
  sumCents,
} from '@guara/utils';

import {
  ALLOCATION_GROUPS,
  SUBCLASSES,
  TARGET_ALLOCATIONS,
  groupTargets,
  subclassLabel,
  type AllocationGroup,
  type SubclassKey,
} from '@/constants/target-allocations';

/** A group is out of target when it is more than 5 p.p. away (Fundamentos). */
export const OUT_OF_TARGET = 5;
/** Up to 2 p.p. counts as close to the target. */
export const CLOSE_TO_TARGET = 2;

/** What the allocation needs from a position. */
export interface AllocatedPosition {
  name: string;
  ticker: string;
  value: Cents;
  subclass: SubclassKey;
}

export interface SubclassRow {
  key: SubclassKey;
  label: string;
  /** "PETR4 e BOVA11 · R$ 10.691,50" parts; `null` without holdings. */
  holdings: { label: string; value: Cents } | null;
  value: Cents;
  /** Share of the portfolio, 1 decimal. */
  current: number;
  target: number;
  /** current − target, in p.p. (1 decimal). */
  difference: number;
}

export interface GroupRow extends AllocationGroup {
  value: Cents;
  current: number;
  target: number;
  difference: number;
  /** Target in reais and how far the group is from it (positive: above). */
  targetValue: Cents;
  gap: Cents;
  subclasses: SubclassRow[];
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Share of `value` in `total`, 1 decimal (integer math on cents). */
export function shareOf(value: Cents, total: Cents): number {
  if (total <= 0) return 0;
  return Math.round((value * 1000) / total) / 10;
}

/** "36,2%", "46%" (1 decimal, no ",0"). */
export function shareText(value: number): string {
  return formatPercent(value, { fractionDigits: Number.isInteger(round1(value)) ? 0 : 1 });
}

/** "+17,2 p.p.", "−2 p.p." or "no alvo". */
export function differenceText(difference: number): string {
  const value = round1(difference);
  if (value === 0) return 'no alvo';
  const number = formatPercent(Math.abs(value), {
    fractionDigits: Number.isInteger(value) ? 0 : 1,
  }).replace('%', '');
  return `${value > 0 ? '+' : '−'}${number} p.p.`;
}

/** Up to 2 p.p.: close (neutral); above in Urucum, below in Arara-azul. */
export type DifferenceTone = 'close' | 'above' | 'below';

export function differenceTone(difference: number): DifferenceTone {
  if (Math.abs(difference) <= CLOSE_TO_TARGET) return 'close';
  return difference > 0 ? 'above' : 'below';
}

/** "PETR4 e BOVA11", "5 BDRs", or what the subclass holds ("Tesouro Selic, CDB/LCI/LCA…"). */
function holdingsLabel(key: SubclassKey, positions: readonly AllocatedPosition[]): string {
  const subclass = SUBCLASSES[key];
  if (subclass.description) return subclass.description;
  if (positions.length <= 2) return positions.map((position) => position.ticker).join(' e ');
  return `${positions.length} ${subclass.unit ?? 'ativos'}`;
}

/**
 * The portfolio against the target of a profile: 5 groups, each with the subclasses of the
 * profile plus any held subclass the profile leaves out (target 0).
 */
export function allocationByGroup(
  positions: readonly AllocatedPosition[],
  profile: InvestorProfileType,
): { total: Cents; groups: GroupRow[] } {
  const total = sumCents(positions.map((position) => position.value));
  const targets = groupTargets(profile);
  const profileSubclasses = TARGET_ALLOCATIONS[profile];
  const held = (key: SubclassKey) => positions.filter((position) => position.subclass === key);

  const groups = ALLOCATION_GROUPS.map((group): GroupRow => {
    const keys = [
      ...profileSubclasses
        .filter((item) => SUBCLASSES[item.subclass].group === group.key)
        .map((item) => item.subclass),
      ...positions
        .map((position) => position.subclass)
        .filter(
          (key, index, all) =>
            SUBCLASSES[key].group === group.key &&
            all.indexOf(key) === index &&
            !profileSubclasses.some((item) => item.subclass === key),
        ),
    ];
    const subclasses = keys.map((key): SubclassRow => {
      const holdings = held(key);
      const value = sumCents(holdings.map((position) => position.value));
      const current = shareOf(value, total);
      const target = profileSubclasses.find((item) => item.subclass === key)?.share ?? 0;
      return {
        key,
        label: subclassLabel(profile, key),
        holdings: holdings.length ? { label: holdingsLabel(key, holdings), value } : null,
        value,
        current,
        target,
        difference: round1(current - target),
      };
    });
    const value = sumCents(subclasses.map((item) => item.value));
    const current = shareOf(value, total);
    const target = targets[group.key];
    const targetValue = multiplyCents(total, target / 100);
    return {
      ...group,
      value,
      current,
      target,
      difference: round1(current - target),
      targetValue,
      gap: subtractCents(value, targetValue),
      subclasses,
    };
  });
  return { total, groups };
}

/** Groups more than 5 p.p. away, the biggest gap first. */
export function outOfTarget(groups: readonly GroupRow[]): GroupRow[] {
  return groups
    .filter((group) => Math.abs(group.difference) > OUT_OF_TARGET)
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

/** The group farthest from the target (`null` when every group is on it). */
export function biggestGap(groups: readonly GroupRow[]): GroupRow | null {
  const sorted = [...groups].sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
  return sorted[0] && sorted[0].difference !== 0 ? sorted[0] : null;
}

/** Share of the portfolio that would change group to match the profile (sum of the excesses). */
export function shareToMove(groups: readonly GroupRow[]): number {
  return round1(groups.reduce((sum, group) => sum + Math.max(0, group.difference), 0));
}

/** Bars of a list share one scale: 60, 80 or 100% fills the track. */
export function barScale(values: readonly number[], step = 20): number {
  const max = Math.max(1, ...values);
  return Math.min(100, Math.ceil(max / step) * step);
}

/** "17,2 p.p. acima", "14 p.p. abaixo". */
export function directionText(difference: number): string {
  return `${differenceText(Math.abs(difference)).replace('+', '')} ${difference > 0 ? 'acima' : 'abaixo'}`;
}

/** "faltam R$ 967,13" or "R$ 8.287,03 acima" (`null` on the target). */
export function gapText(gap: Cents): string | null {
  if (gap === 0) return null;
  const value = formatCents(Math.abs(gap));
  return gap < 0 ? `faltam ${value}` : `${value} acima`;
}

const lowerFirst = (text: string) => text.charAt(0).toLocaleLowerCase('pt-BR') + text.slice(1);

/**
 * The Pacu's way to get closer without selling: the next contributions go to the groups below
 * the target, so the ones above shrink. `null` when no group is out of target on both sides.
 */
export function rebalanceSuggestion(groups: readonly GroupRow[], monthly: Cents): string | null {
  const out = outOfTarget(groups);
  const below = out.filter((group) => group.difference < 0).map((group) => lowerFirst(group.label));
  const above = out.filter((group) => group.difference > 0).map((group) => lowerFirst(group.label));
  if (!below.length || !above.length) return null;
  const shrinking =
    above.length === 1
      ? `a parte de ${above[0]} vai diminuindo`
      : `as partes de ${joinList(above)} vão diminuindo`;
  return `Dá para chegar mais perto do alvo sem vender nada: se os próximos aportes forem para ${joinList(below)}, ${shrinking}. Quer que eu simule com ${formatCents(monthly, { wholeUnits: true })} por mês?`;
}
