import type { AllocationGroupKey, AllocationSubclass, InvestorProfileType } from '@guara/types';
import { colors } from '@guara/ui-tokens';

export type { AllocationGroupKey };

export interface AllocationGroup {
  key: AllocationGroupKey;
  label: string;
  /** "RF Brasil", "RV intern." (charts and tight spots). */
  short: string;
  /** The same color in donut, bar, legend and list, on every screen. */
  color: string;
}

export const ALLOCATION_GROUPS: AllocationGroup[] = [
  { key: 'brFixed', label: 'Renda fixa Brasil', short: 'RF Brasil', color: colors.info.DEFAULT },
  {
    key: 'intlFixed',
    label: 'Renda fixa internacional',
    short: 'RF intern.',
    color: colors.foreground.subtle,
  },
  {
    key: 'brEquity',
    label: 'Renda variável Brasil',
    short: 'RV Brasil',
    color: colors.negative.DEFAULT,
  },
  {
    key: 'intlEquity',
    label: 'Renda variável internacional',
    short: 'RV intern.',
    color: colors.brand.DEFAULT,
  },
  { key: 'crypto', label: 'Cripto', short: 'Cripto', color: colors.positive.DEFAULT },
];

export const allocationGroup = (key: AllocationGroupKey) =>
  ALLOCATION_GROUPS.find((group) => group.key === key)!;

/** Subclasses: stable keys of the contract; each profile may name them a little differently. */
export type SubclassKey = AllocationSubclass;

export interface Subclass {
  group: AllocationGroupKey;
  label: string;
  /** What goes in it, shown under the name ("Tesouro Selic, CDB/LCI/LCA pós, fundos DI"). */
  description?: string;
  /** Noun for several holdings ("5 BDRs"); default "ativos". */
  unit?: string;
}

export const SUBCLASSES: Record<SubclassKey, Subclass> = {
  postFixed: {
    group: 'brFixed',
    label: 'Pós-fixada',
    description: 'Tesouro Selic, CDB/LCI/LCA pós, fundos DI',
  },
  inflation: { group: 'brFixed', label: 'Inflação (IPCA+)' },
  prefixed: { group: 'brFixed', label: 'Prefixada' },
  privateCredit: { group: 'brFixed', label: 'Crédito privado' },
  treasuries: { group: 'intlFixed', label: 'Treasuries' },
  bonds: { group: 'intlFixed', label: 'Bonds investment grade' },
  distressedDebt: { group: 'intlFixed', label: 'Dívida estruturada/distressed' },
  largeCaps: { group: 'brEquity', label: 'Ações large cap' },
  smallCaps: { group: 'brEquity', label: 'Ações small caps' },
  reits: { group: 'brEquity', label: 'FIIs' },
  intlEtfs: { group: 'intlEquity', label: 'ETFs internacionais' },
  intlStocks: { group: 'intlEquity', label: 'Ações diretas', unit: 'BDRs' },
  intlFunds: { group: 'intlEquity', label: 'Fundos de ações internacionais' },
  privateEquity: { group: 'intlEquity', label: 'Private equity/venture capital' },
  bitcoin: { group: 'crypto', label: 'Bitcoin' },
  ethereum: { group: 'crypto', label: 'Ethereum' },
  altcoins: { group: 'crypto', label: 'Altcoins' },
  stablecoins: { group: 'crypto', label: 'Stablecoins' },
};

export interface TargetSubclass {
  subclass: SubclassKey;
  /** Share of the whole portfolio, in percent. */
  share: number;
  /** The name this profile uses ("Ações large cap/blue chips"), when different. */
  label?: string;
}

const t = (subclass: SubclassKey, share: number, label?: string): TargetSubclass => ({
  subclass,
  share,
  ...(label ? { label } : null),
});

/**
 * Target allocation of each investor profile (business rule; may change), in subclasses.
 * The group shares come from them.
 */
export const TARGET_ALLOCATIONS: Record<InvestorProfileType, TargetSubclass[]> = {
  conservative: [
    t('postFixed', 48),
    t('inflation', 17),
    t('prefixed', 5),
    t('privateCredit', 5, 'Crédito privado baixo risco'),
    t('treasuries', 8),
    t('bonds', 5),
    t('largeCaps', 4, 'Ações large cap/blue chips'),
    t('reits', 2, 'FIIs (papel, baixo risco)'),
    t('intlEtfs', 4),
    t('bitcoin', 2),
  ],
  moderate: [
    t('postFixed', 24),
    t('inflation', 14),
    t('prefixed', 5),
    t('privateCredit', 5),
    t('treasuries', 8),
    t('bonds', 6),
    t('largeCaps', 10),
    t('smallCaps', 3),
    t('reits', 6),
    t('intlEtfs', 9),
    t('intlStocks', 5, 'Ações diretas/BDRs'),
    t('bitcoin', 4),
    t('ethereum', 1),
  ],
  aggressive: [
    t('postFixed', 9),
    t('inflation', 7),
    t('prefixed', 4),
    t('privateCredit', 3),
    t('treasuries', 7),
    t('bonds', 8, 'Bonds (IG + parcela high yield)'),
    t('largeCaps', 13),
    t('smallCaps', 8),
    t('reits', 9),
    t('intlEtfs', 9),
    t('intlStocks', 7),
    t('intlFunds', 4),
    t('bitcoin', 7),
    t('ethereum', 3),
    t('altcoins', 2),
  ],
  sophisticated: [
    t('privateCredit', 7, 'Crédito privado estruturado'),
    t('postFixed', 3, 'Pós-fixada/liquidez'),
    t('inflation', 3),
    t('treasuries', 8),
    t('bonds', 9, 'Bonds (IG + high yield)'),
    t('distressedDebt', 5),
    t('largeCaps', 9),
    t('smallCaps', 6, 'Ações small/mid caps'),
    t('reits', 10),
    t('intlEtfs', 9),
    t('intlStocks', 6),
    t('privateEquity', 7),
    t('intlFunds', 3),
    t('bitcoin', 8),
    t('ethereum', 4),
    t('altcoins', 2),
    t('stablecoins', 1),
  ],
};

/** "Para quem" each profile is (Os 4 perfis). */
export const PROFILE_AUDIENCE: Record<InvestorProfileType, string> = {
  conservative: 'Proteger o que já tem, com pouca oscilação',
  moderate: 'Equilíbrio entre proteção e crescimento',
  aggressive: 'Crescer no longo prazo, aceitando quedas no caminho',
  sophisticated: 'Experiência com estruturados e alternativos',
};

/** Target share of each group for the profile. */
export function groupTargets(type: InvestorProfileType): Record<AllocationGroupKey, number> {
  const targets: Record<AllocationGroupKey, number> = {
    brFixed: 0,
    intlFixed: 0,
    brEquity: 0,
    intlEquity: 0,
    crypto: 0,
  };
  for (const item of TARGET_ALLOCATIONS[type])
    targets[SUBCLASSES[item.subclass].group] += item.share;
  return targets;
}

/** Name of a subclass in a profile ("Ações large cap/blue chips" for the Conservador). */
export function subclassLabel(type: InvestorProfileType, key: SubclassKey): string {
  return (
    TARGET_ALLOCATIONS[type].find((item) => item.subclass === key)?.label ?? SUBCLASSES[key].label
  );
}
