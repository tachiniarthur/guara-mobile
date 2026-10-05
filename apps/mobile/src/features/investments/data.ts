import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents } from '@guara/utils';

import type { IconName } from '@/components/ui';

/** Investimentos as shown in the design (static until the API exists). */
export const PORTFOLIO = {
  quotesLabel: 'Cotações atualizadas às 14:30',
  sourcesLabel:
    'Cotações atualizadas às 14:30 · posições dos bancos conectados e cadastradas por você',
  profile: 'Moderado',
  total: cents(4_831_090),
  monthGain: '+R$ 862,40 em setembro (+1,8%)',
  netWorth: cents(74_681_090),
  propertiesTotal: cents(69_850_000),
  positionsCount: 12,
  stats: [
    {
      label: 'Rentabilidade em 12 meses',
      caption: 'CDI no período: +9,9%',
      value: '+11,1%',
      tone: 'positive',
    },
    {
      label: 'Aportes em 2026',
      caption: 'R$ 1.067 por mês, em média',
      value: 'R$ 9.600',
      tone: 'default',
    },
    {
      label: 'Proventos em 2026',
      caption: 'Dividendos, JCP e rendimentos',
      value: 'R$ 1.284',
      tone: 'default',
    },
  ],
} as const;

/** Cumulative return (%) per month, Oct → Sep: portfolio and CDI. */
export const PERFORMANCE = {
  months: ['out', 'nov', 'dez', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set'],
  portfolio: [0, 1.2, 0.6, 2.1, 3.4, 2.8, 4.9, 6.1, 5.4, 7.8, 9.2, 11.1],
  cdi: [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4, 6.3, 7.2, 8.1, 9.0, 9.9],
  accessibilityLabel: 'Rentabilidade em 12 meses: carteira +11,1%, CDI +9,9%',
} as const;

export const ASSET_CLASSES = [
  {
    key: 'fixed',
    label: 'Renda fixa',
    short: 'R. fixa',
    color: colors.info.DEFAULT,
    current: 46,
    target: 50,
  },
  {
    key: 'stocks',
    label: 'Ações',
    short: 'Ações',
    color: colors.negative.DEFAULT,
    current: 22,
    target: 20,
  },
  {
    key: 'reits',
    label: 'FIIs',
    short: 'FIIs',
    color: colors.brand.DEFAULT,
    current: 14,
    target: 15,
  },
  {
    key: 'crypto',
    label: 'Cripto',
    short: 'Cripto',
    color: colors.positive.DEFAULT,
    current: 10,
    target: 5,
  },
  {
    key: 'intl',
    label: 'Internacional',
    short: 'Intern.',
    color: colors.foreground.subtle,
    current: 8,
    target: 10,
  },
] as const;

/** Where each part of the portfolio is exposed: a country on the globe or the orbit (no country). */
export const EXPOSURE = [
  {
    key: 'BR',
    /** ISO 3166-1 numeric code and the marker position on the globe. */
    place: { countryId: 76, lat: -10.6, lon: -53.2 },
    label: 'Brasil',
    /** "Ativos no Brasil". */
    where: 'no Brasil',
    detail: 'Renda fixa, ações e FIIs',
    share: 82,
    value: cents(3_961_500),
    color: colors.brand.DEFAULT,
  },
  {
    key: 'US',
    place: { countryId: 840, lat: 39.5, lon: -98.4 },
    label: 'Estados Unidos',
    where: 'nos Estados Unidos',
    detail: 'Via IVVB11, que segue o S&P 500',
    share: 8,
    value: cents(386_500),
    color: colors.info.DEFAULT,
  },
  {
    key: 'none',
    place: null,
    label: 'Sem país',
    where: 'sem país',
    detail: 'Bitcoin, negociado no mundo todo',
    share: 10,
    value: cents(483_100),
    color: colors.positive.DEFAULT,
  },
] as const;

export interface PropertyItem {
  id: string;
  name: string;
  icon: IconName;
  value: Cents;
  detail: string;
  source: string;
}

export const PROPERTIES: PropertyItem[] = [
  {
    id: 'apto',
    name: 'Apartamento em Pinheiros',
    icon: 'home',
    value: cents(62_000_000),
    detail: 'Imóvel · saldo devedor R$ 214.300',
    source: 'Valor estimado por você em ago/2026',
  },
  {
    id: 'onix',
    name: 'Onix LT 2022',
    icon: 'car',
    value: cents(7_850_000),
    detail: 'Veículo · quitado',
    source: 'Tabela FIPE de setembro · −0,8% no mês',
  },
];

export type RiskLevel = 'Baixo' | 'Médio' | 'Alto';

export interface Position {
  id: string;
  /** Route param of the asset page. */
  ticker: string;
  name: string;
  detail: string;
  value: Cents;
  /** Day change in percent. */
  change: number;
  className: string;
  instrument: string;
  risk: RiskLevel;
  share: number;
  quantity: string | null;
  averagePrice: Cents | null;
  origin: { kind: 'openFinance' | 'manual' | 'chat'; label: string; updated?: string };
}

export interface PositionGroup {
  label: string;
  total: Cents;
  share: number;
  positions: Position[];
}

export const POSITION_GROUPS: PositionGroup[] = [
  {
    label: 'Renda fixa',
    total: cents(2_222_210),
    share: 46,
    positions: [
      {
        id: 'selic',
        ticker: 'TESOURO-SELIC-2029',
        name: 'Tesouro Selic 2029',
        detail: 'Tesouro Direto · pós-fixado, vence em 2029',
        value: cents(1_589_210),
        change: 0.04,
        className: 'Renda fixa',
        instrument: 'Título público',
        risk: 'Baixo',
        share: 32.9,
        quantity: null,
        averagePrice: null,
        origin: { kind: 'openFinance', label: 'Itaú · Open Finance' },
      },
      {
        id: 'cdb',
        ticker: 'CDB-110-CDI',
        name: 'CDB 110% CDI',
        detail: 'Nubank · garantido pelo FGC',
        value: cents(633_000),
        change: 0.04,
        className: 'Renda fixa',
        instrument: 'CDB',
        risk: 'Baixo',
        share: 13.1,
        quantity: null,
        averagePrice: null,
        origin: { kind: 'openFinance', label: 'Nubank · Open Finance' },
      },
    ],
  },
  {
    label: 'Renda variável',
    total: cents(1_069_150),
    share: 22.1,
    positions: [
      {
        id: 'petr4',
        ticker: 'PETR4',
        name: 'PETR4',
        detail: 'Petrobras PN',
        value: cents(756_400),
        change: -1.12,
        className: 'Renda variável',
        instrument: 'Ação',
        risk: 'Alto',
        share: 15.7,
        quantity: '200',
        averagePrice: cents(3_510),
        origin: { kind: 'manual', label: 'Cadastro manual', updated: 'Atualizado em 20/09' },
      },
      {
        id: 'bova11',
        ticker: 'BOVA11',
        name: 'BOVA11',
        detail: 'iShares Ibovespa',
        value: cents(312_750),
        change: 0.38,
        className: 'Renda variável',
        instrument: 'ETF',
        risk: 'Médio',
        share: 6.5,
        quantity: '25',
        averagePrice: null,
        origin: { kind: 'manual', label: 'Cadastro manual', updated: 'Atualizado em 12/09' },
      },
    ],
  },
  {
    label: 'Imobiliário',
    total: cents(677_460),
    share: 14,
    positions: [
      {
        id: 'hglg11',
        ticker: 'HGLG11',
        name: 'HGLG11',
        detail: 'Pátria Log · galpões logísticos',
        value: cents(677_460),
        change: 0.21,
        className: 'Imobiliário',
        instrument: 'Fundo imobiliário',
        risk: 'Médio',
        share: 14,
        quantity: '42',
        averagePrice: null,
        origin: { kind: 'chat', label: 'Cadastro via chat', updated: 'Atualizado em 18/09' },
      },
    ],
  },
  {
    label: 'Alternativos',
    total: cents(479_856),
    share: 9.9,
    positions: [
      {
        id: 'btc',
        ticker: 'BTC',
        name: 'Bitcoin',
        detail: 'BTC',
        value: cents(479_856),
        change: 2.4,
        className: 'Alternativos',
        instrument: 'Criptomoeda',
        risk: 'Alto',
        share: 9.9,
        quantity: '0,0078',
        averagePrice: null,
        origin: { kind: 'manual', label: 'Cadastro manual', updated: 'Atualizado em 15/09' },
      },
    ],
  },
];

export const OTHER_POSITIONS = { count: 6, total: cents(382_414), share: 7.9 } as const;

export type ExposureKey = (typeof EXPOSURE)[number]['key'];

export interface ExposureAsset {
  /** Asset page, when there is one. */
  ticker: string | null;
  name: string;
  detail: string;
  value: Cents;
}

const ALL_POSITIONS = POSITION_GROUPS.flatMap((group) => group.positions);
const fromPosition = (ticker: string): ExposureAsset[] =>
  ALL_POSITIONS.filter((position) => position.ticker === ticker).map((position) => ({
    ticker: position.ticker,
    name: position.name,
    detail: position.detail,
    value: position.value,
  }));

/** The investments behind each place of the globe (values come from the positions). */
export const EXPOSURE_ASSETS: Record<ExposureKey, ExposureAsset[]> = {
  BR: ['TESOURO-SELIC-2029', 'CDB-110-CDI', 'PETR4', 'BOVA11', 'HGLG11'].flatMap(fromPosition),
  US: [
    {
      ticker: null,
      name: 'IVVB11',
      detail: 'ETF negociado na B3 que segue o S&P 500',
      value: cents(386_500),
    },
  ],
  none: fromPosition('BTC'),
};
