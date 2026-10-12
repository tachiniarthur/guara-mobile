import type { Cents } from '@guara/types';
import { cents } from '@guara/utils';

import type { SubclassKey } from '@/constants/target-allocations';

/** "Adicionar investimento" (static until the API exists). */

export const INVESTMENT_TYPES = [
  { key: 'listed', label: 'Ações, FIIs e ETFs' },
  { key: 'fixed', label: 'Renda fixa' },
  { key: 'crypto', label: 'Cripto' },
  { key: 'property', label: 'Imóvel' },
  { key: 'vehicle', label: 'Veículo' },
  { key: 'other', label: 'Outros bens' },
] as const;

export type InvestmentType = (typeof INVESTMENT_TYPES)[number]['key'];

export interface QuotedAsset {
  ticker: string;
  name: string;
  price: Cents;
  /** Subclass of the target allocation the asset counts toward. */
  subclass: SubclassKey;
}

/** Quotes found by the "Ativo" search (Brapi, via the API). */
export const QUOTED_ASSETS: QuotedAsset[] = [
  { ticker: 'PETR4', name: 'Petrobras PN', price: cents(3_782), subclass: 'largeCaps' },
  { ticker: 'BOVA11', name: 'iShares Ibovespa', price: cents(12_510), subclass: 'largeCaps' },
  { ticker: 'HGLG11', name: 'Pátria Log', price: cents(16_130), subclass: 'reits' },
  { ticker: 'BTC', name: 'Bitcoin', price: cents(61_520_000), subclass: 'bitcoin' },
];

export const QUOTE_TIME = '14:30';

/** Example values of the design form. */
export const NEW_ASSET_EXAMPLE = {
  ticker: 'PETR4',
  quantity: '200',
  averagePrice: cents(3_510),
  date: '12/03/2026',
} as const;

export const NEW_ASSET_NOTES = {
  properties:
    'Imóveis e veículos entram no seu patrimônio total. Para veículos, buscamos o valor na Tabela FIPE; para imóveis, você informa o valor estimado e, se houver, o saldo do financiamento.',
  chatExample: '“comprei 42 cotas de HGLG11 a R$ 158”',
  duplicates:
    'Se este ativo também chegar pelo Open Finance, vamos perguntar se você prefere somar, manter separado ou excluir um deles.',
} as const;
