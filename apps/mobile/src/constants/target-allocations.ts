import type { InvestorProfileType } from '@guara/types';

/** Classes of Investimentos (the design's allocation): renda fixa, ações, FIIs, cripto e internacional. */
export type AllocationClassKey = 'fixed' | 'stocks' | 'reits' | 'crypto' | 'intl';

export interface TargetSubclass {
  label: string;
  /** Share of the whole portfolio, in percent. */
  share: number;
  /** Where it counts in the app's classes. */
  appClass: AllocationClassKey;
}

export interface TargetGroup {
  label: string;
  subclasses: TargetSubclass[];
}

const s = (label: string, share: number, appClass: AllocationClassKey): TargetSubclass => ({
  label,
  share,
  appClass,
});

/**
 * Target allocation of each investor profile (business rule; may change). Groups and subclasses
 * as defined by the product; `appClass` maps each subclass to the 5 classes of the design until
 * the screens show the subclasses.
 */
export const TARGET_ALLOCATIONS: Record<InvestorProfileType, TargetGroup[]> = {
  conservative: [
    {
      label: 'Renda fixa Brasil',
      subclasses: [
        s('Pós-fixada (Tesouro Selic, CDB/LCI/LCA pós, fundos DI)', 48, 'fixed'),
        s('Inflação (IPCA+)', 17, 'fixed'),
        s('Prefixada', 5, 'fixed'),
        s('Crédito privado baixo risco (debêntures/CRI/CRA high grade)', 5, 'fixed'),
      ],
    },
    {
      label: 'Renda fixa internacional',
      subclasses: [s('Treasuries', 8, 'intl'), s('Bonds investment grade', 5, 'intl')],
    },
    {
      label: 'Renda variável Brasil',
      subclasses: [
        s('Ações large cap/blue chips', 4, 'stocks'),
        s('FIIs (papel, baixo risco)', 2, 'reits'),
      ],
    },
    {
      label: 'Renda variável internacional',
      subclasses: [s('ETFs internacionais (S&P500/World)', 4, 'intl')],
    },
    { label: 'Cripto', subclasses: [s('Bitcoin', 2, 'crypto')] },
  ],
  moderate: [
    {
      label: 'Renda fixa Brasil',
      subclasses: [
        s('Pós-fixada', 24, 'fixed'),
        s('Inflação (IPCA+)', 14, 'fixed'),
        s('Prefixada', 5, 'fixed'),
        s('Crédito privado', 5, 'fixed'),
      ],
    },
    {
      label: 'Renda fixa internacional',
      subclasses: [s('Treasuries', 8, 'intl'), s('Bonds investment grade', 6, 'intl')],
    },
    {
      label: 'Renda variável Brasil',
      subclasses: [
        s('Ações large cap', 10, 'stocks'),
        s('Ações small caps', 3, 'stocks'),
        s('FIIs', 6, 'reits'),
      ],
    },
    {
      label: 'Renda variável internacional',
      subclasses: [s('ETFs internacionais', 9, 'intl'), s('Ações diretas/BDRs', 5, 'intl')],
    },
    { label: 'Cripto', subclasses: [s('Bitcoin', 4, 'crypto'), s('Ethereum', 1, 'crypto')] },
  ],
  aggressive: [
    {
      label: 'Renda fixa Brasil',
      subclasses: [
        s('Pós-fixada', 9, 'fixed'),
        s('Inflação (IPCA+)', 7, 'fixed'),
        s('Prefixada', 4, 'fixed'),
        s('Crédito privado', 3, 'fixed'),
      ],
    },
    {
      label: 'Renda fixa internacional',
      subclasses: [s('Treasuries', 7, 'intl'), s('Bonds (IG + parcela high yield)', 8, 'intl')],
    },
    {
      label: 'Renda variável Brasil',
      subclasses: [
        s('Ações large cap', 13, 'stocks'),
        s('Ações small caps', 8, 'stocks'),
        s('FIIs', 9, 'reits'),
      ],
    },
    {
      label: 'Renda variável internacional',
      subclasses: [
        s('ETFs internacionais', 9, 'intl'),
        s('Ações diretas', 7, 'intl'),
        s('Fundos de ações internacionais', 4, 'intl'),
      ],
    },
    {
      label: 'Cripto',
      subclasses: [
        s('Bitcoin', 7, 'crypto'),
        s('Ethereum', 3, 'crypto'),
        s('Altcoins', 2, 'crypto'),
      ],
    },
  ],
  sophisticated: [
    {
      label: 'Renda fixa Brasil',
      subclasses: [
        s('Crédito privado estruturado', 7, 'fixed'),
        s('Pós-fixada/liquidez', 3, 'fixed'),
        s('Inflação (IPCA+)', 3, 'fixed'),
      ],
    },
    {
      label: 'Renda fixa internacional',
      subclasses: [
        s('Treasuries', 8, 'intl'),
        s('Bonds (IG + high yield)', 9, 'intl'),
        s('Dívida estruturada/distressed', 5, 'intl'),
      ],
    },
    {
      label: 'Renda variável Brasil',
      subclasses: [
        s('Ações large cap', 9, 'stocks'),
        s('Ações small/mid caps', 6, 'stocks'),
        s('FIIs', 10, 'reits'),
      ],
    },
    {
      label: 'Renda variável internacional',
      subclasses: [
        s('ETFs internacionais', 9, 'intl'),
        s('Ações diretas', 6, 'intl'),
        s('Private equity/venture capital', 7, 'intl'),
        s('Fundos de ações internacionais', 3, 'intl'),
      ],
    },
    {
      label: 'Cripto',
      subclasses: [
        s('Bitcoin', 8, 'crypto'),
        s('Ethereum', 4, 'crypto'),
        s('Altcoins', 2, 'crypto'),
        s('Stablecoins', 1, 'crypto'),
      ],
    },
  ],
};

/** Share of a group ("Renda fixa Brasil: 75%"), from its subclasses. */
export function groupShare(group: TargetGroup): number {
  return group.subclasses.reduce((sum, item) => sum + item.share, 0);
}

/** Targets of the profile in the app's 5 classes (Internacional = renda fixa + variável lá fora). */
export function classTargets(type: InvestorProfileType): Record<AllocationClassKey, number> {
  const targets: Record<AllocationClassKey, number> = {
    fixed: 0,
    stocks: 0,
    reits: 0,
    crypto: 0,
    intl: 0,
  };
  for (const group of TARGET_ALLOCATIONS[type]) {
    for (const item of group.subclasses) targets[item.appClass] += item.share;
  }
  return targets;
}
