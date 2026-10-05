import type { Cents } from '@guara/types';
import type { colors } from '@guara/ui-tokens';
import { cents } from '@guara/utils';

import {
  BOVA11_SERIES,
  BTC_SERIES,
  CDB_110_CDI_SERIES,
  HGLG11_SERIES,
  PETR4_QUOTES,
  TESOURO_SELIC_2029_SERIES,
} from './asset-series';

/** Asset pages as shown in the design (static until the API exists). */

export interface InfoRow {
  label: string;
  value: string;
  /** Explanation shown by the (i) button. */
  info?: string;
  tone?: 'positive' | 'negative' | 'default' | 'subtle';
}

export const METRIC_PERIODS = [
  'No mês',
  'No ano',
  '3M',
  '6M',
  '12M',
  '36M',
  '60M',
  'Desde o início',
] as const;

export type MetricPeriod = (typeof METRIC_PERIODS)[number];

/** One value per entry of `METRIC_PERIODS`, in percentage points (`null` = not available). */
export type PeriodValues = readonly (number | null)[];

export interface AssetMetrics {
  returns: PeriodValues;
  excess: PeriodValues;
  volatility: PeriodValues;
  sharpe: PeriodValues;
  note: string;
}

/** CDI over the same periods (benchmark shared by every asset). */
export const CDI_RETURNS: PeriodValues = [0.9, 10.4, 3.4, 6.9, 14.2, 44.1, 79.8, null];

export type MarkTone = keyof typeof colors.assetMark;

export interface AssetHeader {
  ticker: string;
  /** Letters on the tile ("BR", "ETF", "₿"). */
  mark: string;
  markTone: MarkTone;
  title: string;
  badge: string;
  subtitle: string;
  /** Origin shown with a flag (BRA) or a globe (Global) before the subtitle. */
  region?: 'BRA' | 'Global';
  canAlert: boolean;
}

export interface EventItem {
  date: string;
  kind: string;
  /** Value per share/unit with 4 decimals ("R$ 0,7200"). */
  perUnit: string;
  /** What the user received; `null` when they did not hold the asset on the record date. */
  received: Cents | null;
}

export interface EventList {
  summary: string;
  items: EventItem[];
  total: number;
  note: string;
}

export interface StockAsset {
  kind: 'stock';
  header: AssetHeader;
  price: Cents;
  change: { text: string; up: boolean };
  updated: string;
  quotes: readonly number[];
  averagePrice: number;
  position: {
    caption: string;
    result: { amount: string; percent: string };
    rows: InfoRow[];
    alert: { title: string; detail: string };
  };
  today: { label: string; min: string; max: string; position: number; rows: InfoRow[] };
  year: { min: string; max: string; position: number; rows: InfoRow[] };
  fundamentals: InfoRow[];
  dividends: {
    caption: string;
    /** Reais per share of each payment (oldest first). */
    bars: { month: string; value: number }[];
    items: { title: string; paidOn: string; amount: string | null; note: string }[];
  };
  company: { rows: InfoRow[]; about: string };
  metrics: AssetMetrics;
  events: EventList & { subtitle: string };
  footnote: string;
}

export interface FundAsset {
  kind: 'fund';
  header: AssetHeader;
  chart: {
    /** "Preço da cota", "Preço de 1 BTC" or "Rentabilidade em 12 meses". */
    label: string;
    value: string;
    valueTone: 'default' | 'positive';
    change: { text: string; tone: 'positive' | 'negative' | 'muted' }[];
    period: string;
    adjustable: boolean;
    series: {
      asset: readonly number[];
      benchmark: readonly number[];
      ticks: readonly number[];
      tickYs: readonly number[];
    };
    formatTick: 'money' | 'percent';
    legend: string;
  };
  position: { rows: InfoRow[]; note: string };
  details: { rows: InfoRow[]; risk: 'Baixo' | 'Médio' | 'Alto'; extra: string };
  fees: { total: string; caption: string; rows: InfoRow[] };
  metrics: AssetMetrics;
  events: { subtitle: string } & ({ kind: 'note'; text: string } | ({ kind: 'list' } & EventList));
  questions: string[];
  footnote: string;
}

export type Asset = StockAsset | FundAsset;

const CLASS_INFO =
  'Grupo usado na sua alocação: Renda fixa, Renda variável, Imobiliário, Multimercado, Alternativos ou Caixa.';
const INSTRUMENT_INFO =
  'O tipo de papel: Título público, CDB, Ação, ETF, Fundo imobiliário, Criptomoeda, COE, Fiagro ou FI-Infra.';
export const RISK_INFO =
  'Calculado pelo cadastro do ativo: volatilidade, risco de crédito e liquidez. Você pode ajustar.';
export const ADJUSTED_PRICE_INFO = 'Inclui os rendimentos pagos no período.';
export const METRICS_UPDATED = 'Atualizado em 23 de set. de 2026';
export const COST_INFO = 'Soma das taxas cobradas ao ano sobre o valor investido.';
const BRAPI_FOOTNOTE =
  'Cotações e dados via Brapi e Open Finance, com atraso de até 15 minutos. Informação para acompanhamento, não é recomendação de investimento.';
const NO_AVERAGE =
  'Preço médio não informado. Adicione em “Editar posição” para ver seu resultado.';

const NOTE_EVENTS = 'Dividendos, rendimentos e outros pagamentos';

/** Assets whose design only shows the 12-month column. */
const twelveMonths = (
  returns: number,
  excess: number,
  volatility: number | null,
  sharpe: number | null,
  note: string,
): AssetMetrics => {
  const at12 = (value: number | null): PeriodValues =>
    METRIC_PERIODS.map((period) => (period === '12M' ? value : null));
  return {
    returns: at12(returns),
    excess: at12(excess),
    volatility: at12(volatility),
    sharpe: at12(sharpe),
    note,
  };
};

const monthlyIncome = (dates: string[]): EventItem[] =>
  dates.map((date) => ({ date, kind: 'Rendimento', perUnit: 'R$ 1,1000', received: cents(4_620) }));

export const ASSETS: Record<string, Asset> = {
  PETR4: {
    kind: 'stock',
    header: {
      ticker: 'PETR4',
      mark: 'BR',
      markTone: 'mata',
      title: 'PETR4',
      badge: 'Ações · B3',
      subtitle: 'Petrobras PN · Petróleo Brasileiro S.A.',
      canAlert: true,
    },
    price: cents(3_782),
    change: { text: 'R$ 0,43 (−1,12%) hoje', up: false },
    updated: 'Atualizado às 14:30',
    quotes: PETR4_QUOTES,
    averagePrice: 35.1,
    position: {
      caption: 'Cadastro manual em 12/03/2026',
      result: { amount: '+R$ 544,00', percent: '(+7,7%)' },
      rows: [
        { label: 'Quantidade', value: '200 ações' },
        { label: 'Preço médio', value: 'R$ 35,10' },
        { label: 'Investido', value: 'R$ 7.020,00' },
        { label: 'Vale hoje', value: 'R$ 7.564,00' },
        { label: 'Peso na carteira', value: '15,7%' },
        { label: 'Origem', value: 'Cadastro manual' },
      ],
      alert: { title: 'Alerta de compra ativo', detail: 'Quando cair a R$ 34,00 · faltam 10,1%' },
    },
    today: {
      label: '23 de setembro',
      min: 'Mín. R$ 37,55',
      max: 'Máx. R$ 38,31',
      position: 35.5,
      rows: [
        { label: 'Abertura', value: 'R$ 38,10' },
        { label: 'Fechamento anterior', value: 'R$ 38,25' },
        { label: 'Volume', value: '38,4 milhões' },
      ],
    },
    year: {
      min: 'Mín. R$ 30,12',
      max: 'Máx. R$ 42,50',
      position: 62.2,
      rows: [
        { label: 'Distância da máxima', value: '−11,0%' },
        { label: 'Distância da mínima', value: '+25,6%' },
        { label: 'Variação em 12 meses', value: '+9,4%' },
      ],
    },
    fundamentals: [
      { label: 'Valor de mercado', value: 'R$ 492,8 bi' },
      { label: 'P/L (preço / lucro)', value: '5,1' },
      { label: 'LPA (lucro por ação)', value: 'R$ 7,41' },
      { label: 'Dividend yield (12 meses)', value: '12,3%' },
    ],
    dividends: {
      caption: 'Por ação, nos últimos 2 anos · dividend yield de 12,3%',
      bars: [
        { month: 'out/24', value: 1.05 },
        { month: 'jan/25', value: 0.95 },
        { month: 'mai/25', value: 1.12 },
        { month: 'ago/25', value: 0.74 },
        { month: 'nov/25', value: 0.48 },
        { month: 'fev/26', value: 0.86 },
        { month: 'mai/26', value: 0.64 },
        { month: 'ago/26', value: 0.72 },
      ],
      items: [
        {
          title: 'Dividendos · R$ 0,72 por ação',
          paidOn: 'Pago em 20/08/2026',
          amount: '+R$ 144,00',
          note: 'você recebeu',
        },
        {
          title: 'JCP · R$ 0,64 por ação',
          paidOn: 'Pago em 20/05/2026',
          amount: '+R$ 128,00',
          note: 'você recebeu',
        },
        {
          title: 'Dividendos · R$ 0,86 por ação',
          paidOn: 'Pago em 20/02/2026',
          amount: null,
          note: 'antes da sua compra',
        },
      ],
    },
    company: {
      rows: [
        { label: 'Setor', value: 'Energia' },
        { label: 'Segmento', value: 'Petróleo, gás e biocombustíveis' },
        { label: 'Tipo', value: 'Ação preferencial (PN)' },
        { label: 'Site', value: 'petrobras.com.br' },
      ],
      about:
        'Empresa de energia de capital aberto com controle da União. Atua em exploração e produção de petróleo e gás, refino, logística e comercialização de combustíveis no Brasil e no exterior.',
    },
    metrics: {
      returns: [2.3, 8.9, 5.6, 2.2, 21.7, 58.4, 210.5, null],
      excess: [1.4, -1.5, 2.2, -4.7, 7.5, 14.3, 130.7, null],
      volatility: [24.1, 26.8, 25.2, 26.0, 26.3, 29.4, 33.1, null],
      sharpe: [null, null, null, null, 0.29, 0.12, 0.39, null],
      note: 'Inclui dividendos e JCP reinvestidos.',
    },
    events: {
      subtitle: 'Proventos · valores por ação',
      summary: 'Últimos 12 meses: R$ 2,70 por ação',
      items: [
        { date: '20/08/2026', kind: 'Dividendos', perUnit: 'R$ 0,7200', received: cents(14_400) },
        { date: '20/05/2026', kind: 'JCP', perUnit: 'R$ 0,6400', received: cents(12_800) },
        { date: '20/02/2026', kind: 'Dividendos', perUnit: 'R$ 0,8600', received: null },
        { date: '20/11/2025', kind: 'Dividendos', perUnit: 'R$ 0,4800', received: null },
        { date: '20/08/2025', kind: 'Dividendos', perUnit: 'R$ 0,7400', received: null },
        { date: '20/05/2025', kind: 'JCP', perUnit: 'R$ 1,1200', received: null },
        { date: '20/01/2025', kind: 'Dividendos', perUnit: 'R$ 0,9500', received: null },
        { date: '20/10/2024', kind: 'Dividendos', perUnit: 'R$ 1,0500', received: null },
      ],
      total: 64,
      note: '“—” em Você recebeu: você ainda não tinha a ação na data com (comprou em 12/03/2026).',
    },
    footnote:
      'Cotação e dados da empresa via Brapi, com atraso de até 15 minutos. Informação para acompanhamento, não é recomendação de investimento.',
  },
  BOVA11: {
    kind: 'fund',
    header: {
      ticker: 'BOVA11',
      mark: 'ETF',
      markTone: 'mata',
      title: 'BOVA11',
      badge: 'Renda variável · ETF · B3',
      subtitle: 'iShares Ibovespa · gestão BlackRock',
      region: 'BRA',
      canAlert: true,
    },
    chart: {
      label: 'Preço da cota',
      value: 'R$ 125,10',
      valueTone: 'default',
      change: [
        { text: 'R$ 13,80 ▲ (12,40%)', tone: 'positive' },
        { text: '87,6% do CDI (−1,75 p.p.)', tone: 'muted' },
      ],
      period: '23 SET 2025 – 23 SET 2026',
      adjustable: true,
      series: BOVA11_SERIES,
      formatTick: 'money',
      legend: 'BOVA11',
    },
    position: {
      rows: [
        { label: 'Quantidade', value: '25 cotas' },
        { label: 'Preço médio', value: '—', tone: 'subtle' },
        { label: 'Valor hoje', value: 'R$ 3.127,50' },
        { label: '% da carteira', value: '6,5%' },
        { label: 'Origem', value: 'Cadastro manual' },
        { label: 'Atualização', value: '12/09' },
      ],
      note: NO_AVERAGE,
    },
    details: {
      rows: [
        { label: 'Nome', value: 'iShares Ibovespa Fundo de Índice' },
        { label: 'Classe', value: 'Renda variável', info: CLASS_INFO },
        { label: 'Instrumento', value: 'ETF', info: INSTRUMENT_INFO },
        { label: 'Gestor', value: 'BlackRock' },
        { label: 'Índice', value: 'Ibovespa' },
      ],
      risk: 'Médio',
      extra: 'Replica o Ibovespa · negociado na B3',
    },
    fees: {
      total: '0,10%',
      caption: 'ao ano (taxa de administração)',
      rows: [
        { label: 'Taxa de administração', value: '0,10% ao ano' },
        {
          label: 'Imposto de renda',
          value: '15% sobre o lucro na venda, sem isenção de R$ 20 mil',
        },
        { label: 'Corretagem', value: 'Depende da sua corretora' },
        { label: 'Onde negocia', value: 'B3, em horário de pregão' },
      ],
    },
    metrics: twelveMonths(
      12.4,
      -1.8,
      18.4,
      -0.1,
      'Preço ajustado. O ETF reinveste os dividendos das empresas do índice.',
    ),
    events: {
      subtitle: NOTE_EVENTS,
      kind: 'note',
      text: 'O BOVA11 não distribui dividendos. Os proventos das empresas do Ibovespa são reinvestidos no próprio fundo e aparecem no preço da cota.',
    },
    questions: [
      'Qual papel o BOVA11 tem na minha carteira?',
      'BOVA11 é uma boa forma de investir no Ibovespa?',
      'Quanto do meu patrimônio está em renda variável?',
    ],
    footnote: BRAPI_FOOTNOTE,
  },
  HGLG11: {
    kind: 'fund',
    header: {
      ticker: 'HGLG11',
      mark: 'FII',
      markTone: 'terra',
      title: 'HGLG11',
      badge: 'Imobiliário · FII · B3',
      subtitle: 'Pátria Log · galpões logísticos',
      region: 'BRA',
      canAlert: true,
    },
    chart: {
      label: 'Preço da cota',
      value: 'R$ 161,30',
      valueTone: 'default',
      change: [
        { text: 'R$ 10,30 ▲ (6,82%)', tone: 'positive' },
        { text: '48,2% do CDI (−7,33 p.p.)', tone: 'muted' },
      ],
      period: '23 SET 2025 – 23 SET 2026',
      adjustable: true,
      series: HGLG11_SERIES,
      formatTick: 'money',
      legend: 'HGLG11',
    },
    position: {
      rows: [
        { label: 'Quantidade', value: '42 cotas' },
        { label: 'Preço médio', value: '—', tone: 'subtle' },
        { label: 'Valor hoje', value: 'R$ 6.774,60' },
        { label: '% da carteira', value: '14,0%' },
        { label: 'Origem', value: 'Cadastro via chat' },
        { label: 'Atualização', value: '18/09' },
      ],
      note: NO_AVERAGE,
    },
    details: {
      rows: [
        { label: 'Nome', value: 'Pátria Log FII' },
        { label: 'Classe', value: 'Imobiliário', info: CLASS_INFO },
        { label: 'Instrumento', value: 'Fundo imobiliário', info: INSTRUMENT_INFO },
        { label: 'Gestor', value: 'Pátria Investimentos' },
        { label: 'Segmento', value: 'Galpões logísticos' },
      ],
      risk: 'Médio',
      extra: 'Paga rendimentos todo mês · negociado na B3',
    },
    fees: {
      total: '—',
      caption: 'a fonte de dados não informa a taxa deste fundo',
      rows: [
        { label: 'Taxa de administração', value: '— (não informada pela fonte)' },
        {
          label: 'Rendimentos mensais',
          value: 'Isentos de IR para pessoa física, dentro das regras',
        },
        { label: 'Imposto na venda', value: '20% sobre o lucro' },
        { label: 'Onde negocia', value: 'B3, em horário de pregão' },
      ],
    },
    metrics: {
      returns: [1.3, 9.4, 2.8, 5.1, 15.0, 33.0, 42.7, null],
      excess: [0.4, -1.0, -0.6, -1.8, 0.8, -11.1, -37.1, null],
      volatility: [9.4, 10.2, 9.8, 10.5, 10.8, 11.9, 12.6, null],
      sharpe: [null, null, null, null, 0.07, -0.25, -0.4, null],
      note: 'Inclui os rendimentos mensais pagos no período.',
    },
    events: {
      subtitle: 'Rendimentos · valores por cota',
      kind: 'list',
      summary: 'Últimos 12 meses: R$ 13,20 por cota · dividend yield de 8,2%',
      items: monthlyIncome([
        '15/09/2026',
        '14/08/2026',
        '15/07/2026',
        '15/06/2026',
        '15/05/2026',
        '15/04/2026',
        '13/03/2026',
        '13/02/2026',
      ]),
      total: 184,
      note: 'Rendimentos de FII são isentos de IR para pessoa física, dentro das regras. Valores de exemplo.',
    },
    questions: [
      'Qual papel o HGLG11 tem na minha carteira?',
      'Os rendimentos do HGLG11 estão estáveis?',
      'Quais são os riscos de um FII de galpões?',
    ],
    footnote: BRAPI_FOOTNOTE,
  },
  BTC: {
    kind: 'fund',
    header: {
      ticker: 'BTC',
      mark: '₿',
      markTone: 'ouro',
      title: 'Bitcoin',
      badge: 'Alternativos · Criptomoeda',
      subtitle: 'BTC · negociado 24 horas por dia',
      region: 'Global',
      canAlert: true,
    },
    chart: {
      label: 'Preço de 1 BTC',
      value: 'R$ 615.200',
      valueTone: 'default',
      change: [
        { text: 'R$ 171.400 ▲ (38,62%)', tone: 'positive' },
        { text: '272,9% do CDI (+24,47 p.p.)', tone: 'muted' },
      ],
      period: '23 SET 2025 – 23 SET 2026',
      adjustable: false,
      series: BTC_SERIES,
      formatTick: 'money',
      legend: 'Bitcoin',
    },
    position: {
      rows: [
        { label: 'Quantidade', value: '0,0078 BTC' },
        { label: 'Preço médio', value: '—', tone: 'subtle' },
        { label: 'Valor hoje', value: 'R$ 4.798,56' },
        { label: '% da carteira', value: '9,9%' },
        { label: 'Origem', value: 'Cadastro manual' },
        { label: 'Atualização', value: '15/09' },
      ],
      note: NO_AVERAGE,
    },
    details: {
      rows: [
        { label: 'Nome', value: 'Bitcoin' },
        { label: 'Classe', value: 'Alternativos', info: CLASS_INFO },
        { label: 'Instrumento', value: 'Criptomoeda', info: INSTRUMENT_INFO },
        { label: 'Emissor', value: 'Não tem (rede descentralizada)' },
        { label: 'Negociação', value: '24 horas, 7 dias por semana' },
      ],
      risk: 'Alto',
      extra: 'Preço muito volátil · sem garantia do FGC',
    },
    fees: {
      total: '—',
      caption: 'depende da corretora onde você guarda o bitcoin',
      rows: [
        { label: 'Taxa de negociação', value: 'Depende da corretora' },
        { label: 'Taxa de saque', value: 'Depende da corretora e da rede' },
        {
          label: 'Imposto de renda',
          value: '15% sobre o lucro quando as vendas do mês passam de R$ 35 mil',
        },
        { label: 'Garantia', value: 'Não tem cobertura do FGC' },
      ],
    },
    metrics: twelveMonths(
      38.6,
      24.4,
      48.5,
      0.5,
      'Cotação em reais. O Bitcoin é negociado 24 horas por dia.',
    ),
    events: {
      subtitle: NOTE_EVENTS,
      kind: 'note',
      text: 'O Bitcoin não paga dividendos nem rendimentos. O resultado vem só da variação do preço.',
    },
    questions: [
      'Qual papel o Bitcoin tem na minha carteira?',
      'Quanto de bitcoin faz sentido no meu perfil?',
      'Como declarar bitcoin no imposto de renda?',
    ],
    footnote: BRAPI_FOOTNOTE,
  },
  'CDB-110-CDI': {
    kind: 'fund',
    header: {
      ticker: 'CDB-110-CDI',
      mark: 'CDB',
      markTone: 'jabuticaba',
      title: 'CDB 110% CDI',
      badge: 'Renda fixa · CDB',
      subtitle: 'Nubank · pós-fixado · garantido pelo FGC',
      region: 'BRA',
      canAlert: false,
    },
    chart: {
      label: 'Rentabilidade em 12 meses',
      value: '+15,57%',
      valueTone: 'positive',
      change: [
        { text: '110,0% do CDI', tone: 'muted' },
        { text: '+1,42 p.p.', tone: 'positive' },
      ],
      period: '23 SET 2025 – 23 SET 2026',
      adjustable: false,
      series: CDB_110_CDI_SERIES,
      formatTick: 'percent',
      legend: 'CDB 110% CDI',
    },
    position: {
      rows: [
        { label: 'Valor hoje', value: 'R$ 6.330,00' },
        { label: '% da carteira', value: '13,1%' },
        { label: 'Quantidade', value: '—', tone: 'subtle' },
        { label: 'Preço médio', value: '—', tone: 'subtle' },
        { label: 'Origem', value: 'Nubank · Open Finance' },
        { label: 'Atualização', value: 'Automática' },
      ],
      note: 'Atualizado automaticamente pelo Open Finance.',
    },
    details: {
      rows: [
        { label: 'Nome', value: 'CDB Nubank 110% do CDI' },
        { label: 'Classe', value: 'Renda fixa', info: CLASS_INFO },
        { label: 'Instrumento', value: 'CDB', info: INSTRUMENT_INFO },
        { label: 'Emissor', value: 'Nubank' },
        { label: 'Indexador', value: '110% do CDI' },
        { label: 'Vencimento', value: '15/03/2027' },
      ],
      risk: 'Baixo',
      extra: 'Coberto pelo FGC até R$ 250 mil por CPF e instituição',
    },
    fees: {
      total: '0,00%',
      caption: 'CDB não cobra taxa de administração',
      rows: [
        { label: 'Taxa de administração', value: 'Não tem' },
        {
          label: 'Imposto de renda',
          value: 'Tabela regressiva: de 22,5% a 15%, conforme o tempo aplicado',
        },
        { label: 'IOF', value: 'Só em resgates nos primeiros 30 dias' },
        { label: 'Garantia', value: 'FGC até R$ 250 mil por CPF e instituição' },
      ],
    },
    metrics: twelveMonths(
      15.6,
      1.4,
      null,
      null,
      'CDB não tem cotação diária, por isso não há volatilidade nem Sharpe. “Desde o início” conta a partir da sua aplicação, em mar/2025.',
    ),
    events: {
      subtitle: NOTE_EVENTS,
      kind: 'note',
      text: 'Este CDB não paga juros periódicos. O rendimento é pago de uma vez no vencimento, em 15/03/2027, ou se você resgatar antes.',
    },
    questions: [
      'Qual papel o CDB 110% CDI tem na minha carteira?',
      'Esse CDB rende mais que o Tesouro Selic?',
      'Posso resgatar antes do vencimento?',
    ],
    footnote: BRAPI_FOOTNOTE,
  },
  'TESOURO-SELIC-2029': {
    kind: 'fund',
    header: {
      ticker: 'TESOURO-SELIC-2029',
      mark: 'TD',
      markTone: 'rio',
      title: 'Tesouro Selic 2029',
      badge: 'Renda fixa · Tesouro Direto',
      subtitle: 'Tesouro Nacional · título público federal',
      region: 'BRA',
      canAlert: false,
    },
    chart: {
      label: 'Rentabilidade em 12 meses',
      value: '+14,32%',
      valueTone: 'positive',
      change: [
        { text: '101,2% do CDI', tone: 'muted' },
        { text: '+0,17 p.p.', tone: 'positive' },
      ],
      period: '23 SET 2025 – 23 SET 2026',
      adjustable: false,
      series: TESOURO_SELIC_2029_SERIES,
      formatTick: 'percent',
      legend: 'Tesouro Selic 2029',
    },
    position: {
      rows: [
        { label: 'Valor hoje', value: 'R$ 15.892,10' },
        { label: '% da carteira', value: '32,9%' },
        { label: 'Quantidade', value: '—', tone: 'subtle' },
        { label: 'Preço médio', value: '—', tone: 'subtle' },
        { label: 'Origem', value: 'Itaú · Open Finance' },
        { label: 'Atualização', value: 'Automática' },
      ],
      note: 'Atualizado automaticamente pelo Open Finance.',
    },
    details: {
      rows: [
        { label: 'Nome', value: 'Tesouro Selic 2029' },
        { label: 'Classe', value: 'Renda fixa', info: CLASS_INFO },
        { label: 'Instrumento', value: 'Título público', info: INSTRUMENT_INFO },
        { label: 'Emissor', value: 'Tesouro Nacional' },
        { label: 'Indexador', value: 'Selic (pós-fixado)' },
        { label: 'Vencimento', value: '01/03/2029' },
      ],
      risk: 'Baixo',
      extra: 'Liquidez diária · garantido pelo Tesouro Nacional',
    },
    fees: {
      total: '0,07%',
      caption: 'ao ano, sobre o seu saldo atual',
      rows: [
        {
          label: 'Taxa de custódia da B3',
          value: '0,20% ao ano só sobre o que passar de R$ 10 mil',
        },
        { label: 'Taxa da instituição', value: '—' },
        {
          label: 'Imposto de renda',
          value: 'Tabela regressiva: de 22,5% a 15%, conforme o tempo aplicado',
        },
        { label: 'IOF', value: 'Só em resgates nos primeiros 30 dias' },
      ],
    },
    metrics: twelveMonths(14.3, 0.1, 0.2, 0.5, 'Título pós-fixado: acompanha a Selic de perto.'),
    events: {
      subtitle: NOTE_EVENTS,
      kind: 'note',
      text: 'O Tesouro Selic 2029 não paga juros durante o caminho. Todo o rendimento é recebido no resgate ou no vencimento, em 01/03/2029.',
    },
    questions: [
      'Qual papel o Tesouro Selic 2029 tem na minha carteira?',
      'Vale a pena manter o Tesouro Selic como reserva?',
      'O que acontece se eu resgatar antes de 2029?',
    ],
    footnote: BRAPI_FOOTNOTE,
  },
};
