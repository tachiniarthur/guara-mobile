import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents, sharesOf, sumCents } from '@guara/utils';

export type RiskLevel = 'Baixo' | 'Médio' | 'Alto';

/** Classes of the positions page, in the design's order. */
export const POSITION_CLASSES = [
  { key: 'fixed', label: 'Renda fixa' },
  { key: 'variable', label: 'Renda variável' },
  { key: 'realEstate', label: 'Imobiliário' },
  { key: 'alternative', label: 'Alternativos' },
  { key: 'international', label: 'Internacional' },
] as const;

export type PositionClassKey = (typeof POSITION_CLASSES)[number]['key'];

export type PositionOriginKind = 'openFinance' | 'manual' | 'chat';

export interface Position {
  id: string;
  /** Route param of the asset page. */
  ticker: string;
  name: string;
  /** Description in the Investimentos card ("Tesouro Direto · pós-fixado, vence em 2029"). */
  detail: string;
  /** Description in Posições, with the quantity ("Petrobras PN · 200 ações"). */
  listDetail: string;
  value: Cents;
  /** Day change in percent. */
  change: number;
  classKey: PositionClassKey;
  className: string;
  instrument: string;
  risk: RiskLevel;
  /** Share of the portfolio in percent (2 places, all positions sum 100). */
  share: number;
  quantity: string | null;
  averagePrice: Cents | null;
  origin: { kind: PositionOriginKind; label: string; updated?: string };
}

type PositionInput = Omit<Position, 'className' | 'share'>;

const MANUAL = { kind: 'manual', label: 'Cadastro manual' } as const;

const POSITION_INPUTS: PositionInput[] = [
  {
    id: 'selic',
    ticker: 'TESOURO-SELIC-2029',
    name: 'Tesouro Selic 2029',
    detail: 'Tesouro Direto · pós-fixado, vence em 2029',
    listDetail: 'Tesouro Direto · vence em 2029',
    value: cents(1_589_210),
    change: 0.04,
    classKey: 'fixed',
    instrument: 'Título público',
    risk: 'Baixo',
    quantity: null,
    averagePrice: null,
    origin: { kind: 'openFinance', label: 'Itaú · Open Finance' },
  },
  {
    id: 'cdb',
    ticker: 'CDB-110-CDI',
    name: 'CDB 110% CDI',
    detail: 'Nubank · garantido pelo FGC',
    listDetail: 'Nubank · garantido pelo FGC',
    value: cents(633_000),
    change: 0.04,
    classKey: 'fixed',
    instrument: 'CDB',
    risk: 'Baixo',
    quantity: null,
    averagePrice: null,
    origin: { kind: 'openFinance', label: 'Nubank · Open Finance' },
  },
  {
    id: 'petr4',
    ticker: 'PETR4',
    name: 'PETR4',
    detail: 'Petrobras PN',
    listDetail: 'Petrobras PN · 200 ações',
    value: cents(756_400),
    change: -1.12,
    classKey: 'variable',
    instrument: 'Ação',
    risk: 'Alto',
    quantity: '200',
    averagePrice: cents(3_510),
    origin: { ...MANUAL, updated: 'Atualizado em 20/09' },
  },
  {
    id: 'bova11',
    ticker: 'BOVA11',
    name: 'BOVA11',
    detail: 'iShares Ibovespa',
    listDetail: 'iShares Ibovespa · 25 cotas',
    value: cents(312_750),
    change: 0.38,
    classKey: 'variable',
    instrument: 'ETF',
    risk: 'Médio',
    quantity: '25',
    averagePrice: null,
    origin: { ...MANUAL, updated: 'Atualizado em 12/09' },
  },
  {
    id: 'hglg11',
    ticker: 'HGLG11',
    name: 'HGLG11',
    detail: 'Pátria Log · galpões logísticos',
    listDetail: 'Pátria Log · 42 cotas',
    value: cents(677_460),
    change: 0.21,
    classKey: 'realEstate',
    instrument: 'Fundo imobiliário',
    risk: 'Médio',
    quantity: '42',
    averagePrice: null,
    origin: { kind: 'chat', label: 'Cadastro via chat', updated: 'Atualizado em 18/09' },
  },
  {
    id: 'btc',
    ticker: 'BTC',
    name: 'Bitcoin',
    detail: 'BTC',
    listDetail: 'BTC · 0,0078',
    value: cents(479_856),
    change: 2.4,
    classKey: 'alternative',
    instrument: 'Criptomoeda',
    risk: 'Alto',
    quantity: '0,0078',
    averagePrice: null,
    origin: { ...MANUAL, updated: 'Atualizado em 15/09' },
  },
  {
    id: 'ivvb11',
    ticker: 'IVVB11',
    name: 'IVVB11',
    detail: 'iShares S&P 500',
    listDetail: 'iShares S&P 500 · 4 cotas',
    value: cents(140_560),
    change: 0.52,
    classKey: 'international',
    instrument: 'ETF',
    risk: 'Médio',
    quantity: '4',
    averagePrice: null,
    origin: MANUAL,
  },
  {
    id: 'aapl34',
    ticker: 'AAPL34',
    name: 'AAPL34',
    detail: 'Apple · BDR',
    listDetail: 'Apple · BDR · 9 cotas',
    value: cents(71_280),
    change: 0.88,
    classKey: 'international',
    instrument: 'BDR',
    risk: 'Alto',
    quantity: '9',
    averagePrice: null,
    origin: MANUAL,
  },
  {
    id: 'msft34',
    ticker: 'MSFT34',
    name: 'MSFT34',
    detail: 'Microsoft · BDR',
    listDetail: 'Microsoft · BDR · 6 cotas',
    value: cents(59_820),
    change: 0.31,
    classKey: 'international',
    instrument: 'BDR',
    risk: 'Alto',
    quantity: '6',
    averagePrice: null,
    origin: MANUAL,
  },
  {
    id: 'nvdc34',
    ticker: 'NVDC34',
    name: 'NVDC34',
    detail: 'NVIDIA · BDR',
    listDetail: 'NVIDIA · BDR · 15 cotas',
    value: cents(48_690),
    change: -0.74,
    classKey: 'international',
    instrument: 'BDR',
    risk: 'Alto',
    quantity: '15',
    averagePrice: null,
    origin: MANUAL,
  },
  {
    id: 'amzo34',
    ticker: 'AMZO34',
    name: 'AMZO34',
    detail: 'Amazon · BDR',
    listDetail: 'Amazon · BDR · 6 cotas',
    value: cents(35_244),
    change: 0.19,
    classKey: 'international',
    instrument: 'BDR',
    risk: 'Alto',
    quantity: '6',
    averagePrice: null,
    origin: MANUAL,
  },
  {
    id: 'gogl34',
    ticker: 'GOGL34',
    name: 'GOGL34',
    detail: 'Alphabet · BDR',
    listDetail: 'Alphabet · BDR · 4 cotas',
    value: cents(26_820),
    change: 0.42,
    classKey: 'international',
    instrument: 'BDR',
    risk: 'Alto',
    quantity: '4',
    averagePrice: null,
    origin: MANUAL,
  },
];

const POSITION_SHARES = sharesOf(POSITION_INPUTS.map((position) => position.value));

/** Every position of the portfolio, with its class label and share (derived). */
export const POSITIONS: Position[] = POSITION_INPUTS.map((position, index) => ({
  ...position,
  className: POSITION_CLASSES.find((item) => item.key === position.classKey)!.label,
  share: POSITION_SHARES[index]!,
}));

/**
 * Last quote update (Brapi, through our API). `fallbackTime` is set when the last update failed
 * and older quotes are shown ("Mostrando valores das 13:45").
 */
export const QUOTES: { time: string; fallbackTime: string | null } = {
  time: '14:30',
  fallbackTime: null,
};

/** Investimentos as shown in the design (static until the API exists). */
export const PORTFOLIO = {
  quotesLabel: `Cotações atualizadas às ${QUOTES.time}`,
  sourcesLabel: `Cotações atualizadas às ${QUOTES.time} · posições dos bancos conectados e cadastradas por você`,
  profile: 'Moderado',
  total: sumCents(POSITIONS.map((position) => position.value)),
  monthGain: '+R$ 862,40 em setembro (+1,8%)',
  positionsCount: POSITIONS.length,
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

export type ExposureKey = (typeof EXPOSURE)[number]['key'];

export interface ExposureAsset {
  /** Asset page, when there is one. */
  ticker: string | null;
  name: string;
  detail: string;
  value: Cents;
}

const fromPosition = (ticker: string): ExposureAsset[] =>
  POSITIONS.filter((position) => position.ticker === ticker).map((position) => ({
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
