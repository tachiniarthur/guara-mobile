import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents } from '@guara/utils';

import type { IconName } from '@/components/ui';

/** Relatório as shown in the design (static until the API exists). */
export const REPORT = {
  title: 'O que aconteceu com seu dinheiro',
  periodLabel: '1 a 23 de setembro',
  scopeLabel: '1 a 23 de setembro · todos os bancos',
  totals: {
    in: cents(820_000),
    out: cents(591_247),
    left: cents(228_753),
    leftShare: '28% do que entrou',
  },
} as const;

export const PERIODS = [
  { value: '7d', label: '7 dias' },
  { value: 'month', label: 'Este mês' },
  { value: '3m', label: '3 meses' },
  { value: '12m', label: '12 meses' },
] as const;

export type ReportPeriod = (typeof PERIODS)[number]['value'];

export const SPLIT = [
  { label: 'Moradia', share: 36, weight: 2100, color: colors.info.DEFAULT },
  { label: 'Eletrônicos', share: 21, weight: 1250, color: colors.negative.DEFAULT },
  { label: 'Alimentação', share: 13, weight: 742, color: colors.brand.DEFAULT },
  { label: 'Transporte', share: 7, weight: 386, color: colors.positive.DEFAULT },
  { label: 'Outros', share: 24, weight: 1434, color: colors.foreground.subtle },
];

export const BALANCE = {
  start: cents(1_019_279),
  today: cents(1_248_032),
  forecastLabel: '≈ R$ 11.900',
  values: [
    10190, 10152, 10108, 10060, 15117, 15057, 14986, 14927, 14878, 14520, 14466, 14407, 14347,
    14298, 14238, 14168, 14098, 15057, 14618, 14477, 14320, 13729, 12477,
  ],
  projection: [12401, 12331, 12249, 12168, 12081, 11989, 11897],
  markers: [
    { day: 5, label: 'Salário e aluguel', tone: 'in', labelY: 26 },
    { day: 18, label: 'Freela', tone: 'in', labelY: 46 },
    { day: 23, label: 'Eletrônicos', tone: 'out', labelY: 26 },
  ],
  accessibilityLabel:
    'Saldo de setembro: começou em R$ 10,2 mil, subiu para cerca de R$ 15,1 mil no dia 5 com o salário, desceu aos poucos e está em R$ 12,5 mil hoje. Projeção: R$ 11,9 mil no dia 30.',
} as const;

export const WEEKS = {
  data: [
    { label: '1–7', values: [7.2, 2.35] },
    { label: '8–14', values: [0, 1.01] },
    { label: '15–21', values: [1.0, 0.78] },
    { label: '22–23*', values: [0, 1.772] },
  ],
  priciest: '22 a 23 set',
  accessibilityLabel:
    'Entradas e saídas por semana: semana 1 entrou R$ 7.200 e saiu R$ 2.350; semana 2 saiu R$ 1.010; semana 3 entrou R$ 1.000 e saiu R$ 780; dias 22 e 23 saiu R$ 1.772.',
} as const;

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  amount: Cents;
  direction: 'in' | 'out';
  flagged?: boolean;
}

export const TIMELINE: TimelineEvent[] = [
  {
    id: 'e1',
    date: '23 set',
    title: 'Loja de eletrônicos online',
    detail: 'Nubank crédito · 02:14',
    amount: cents(124_990),
    direction: 'out',
    flagged: true,
  },
  {
    id: 'e2',
    date: '18 set',
    title: 'Freela · site institucional',
    detail: 'Pix recebido · Itaú',
    amount: cents(100_000),
    direction: 'in',
  },
  {
    id: 'e3',
    date: '10 set',
    title: 'Mercado do mês',
    detail: 'Itaú débito',
    amount: cents(31_120),
    direction: 'out',
  },
  {
    id: 'e4',
    date: '05 set',
    title: 'Aluguel',
    detail: 'Pix enviado · Itaú',
    amount: cents(210_000),
    direction: 'out',
  },
  {
    id: 'e5',
    date: '05 set',
    title: 'Salário',
    detail: 'Crédito em conta · Itaú',
    amount: cents(720_000),
    direction: 'in',
  },
];

export interface ComparisonRow {
  category: string;
  detail: string;
  change: string;
  icon: IconName;
  tone: 'negative' | 'positive' | 'warning' | 'subtle';
}

export const COMPARISON: ComparisonRow[] = [
  {
    category: 'Alimentação',
    detail: 'R$ 742 contra R$ 662',
    change: '+12%',
    icon: 'arrowUp',
    tone: 'negative',
  },
  {
    category: 'Transporte',
    detail: 'R$ 386 contra R$ 420',
    change: '−8%',
    icon: 'arrowDown',
    tone: 'positive',
  },
  {
    category: 'Eletrônicos',
    detail: 'Não houve gasto em agosto',
    change: 'novo',
    icon: 'infoLarge',
    tone: 'warning',
  },
  {
    category: 'Moradia',
    detail: 'R$ 2.100 nos dois meses',
    change: 'igual',
    icon: 'check',
    tone: 'subtle',
  },
];

export const MONTH_COMPARE = [
  {
    label: 'Entradas',
    change: '+14%',
    tone: 'positive',
    color: colors.info.DEFAULT,
    current: cents(820_000),
    previous: cents(720_000),
    previousShare: 88,
  },
  {
    label: 'Saídas',
    change: '+21%',
    tone: 'negative',
    color: colors.negative.DEFAULT,
    current: cents(591_200),
    previous: cents(490_000),
    previousShare: 83,
  },
] as const;

export const REPORT_CHAT = {
  intro: [
    'Farejei setembro até agora: sobraram ',
    { strong: 'R$ 2.287,53' },
    '. Sem a compra de eletrônicos, seria o seu melhor mês desde maio.',
  ],
  question: 'Quer que eu separe o que é gasto fixo do que é variável?',
  suggestions: ['Sim, separe fixo e variável', 'Compare com agosto'],
} as const;
