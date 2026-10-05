import type { AssistantId, Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents } from '@guara/utils';
import type { Href } from 'expo-router';

import type { AllocationSegment } from '@/components/charts';

/** What each assistant is doing now (static until the API exists). */
export type TeamCardHighlight =
  | { type: 'note'; dot: 'negative' | 'positive'; strong: string; text: string }
  | { type: 'allocation'; change: string; text: string; segments: AllocationSegment[] }
  | { type: 'progress'; strong: string; text: string; percent: number }
  | { type: 'alert'; amount: Cents; text: string };

export interface TeamCardData {
  assistant: AssistantId;
  /** Badge over the scene ("analisando gastos"). */
  status: string;
  /** Something needs the user: Urucum border, badge and metric. */
  alert?: boolean;
  metric: { kind: 'money'; value: Cents } | { kind: 'text'; value: string };
  metricCaption: string;
  highlight: TeamCardHighlight;
  quote: string;
  link: { label: string; href: Href };
}

export const PORTFOLIO_ALLOCATION: AllocationSegment[] = [
  { label: 'renda fixa', percent: 46, color: colors.chart.series[0] },
  { label: 'ações', percent: 22, color: colors.chart.series[1] },
  { label: 'FIIs', percent: 14, color: colors.chart.series[2] },
  { label: 'cripto', percent: 10, color: colors.chart.series[3] },
  { label: 'internacional', percent: 8, color: colors.chart.series[4] },
];

export const TEAM_CARDS: Record<AssistantId, TeamCardData> = {
  capivara: {
    assistant: 'capivara',
    status: 'coordenando a equipe',
    metric: { kind: 'text', value: '6 conversas' },
    metricCaption: 'com a equipe esta semana',
    highlight: { type: 'note', dot: 'positive', strong: 'Hoje:', text: 'gastos de setembro' },
    quote: '“Pergunta do seu jeito que eu chamo quem sabe.”',
    link: { label: 'Abrir conversas', href: '/chat' },
  },
  tamandua: {
    assistant: 'tamandua',
    status: 'analisando gastos',
    metric: { kind: 'money', value: cents(591_247) },
    metricCaption: 'gastos em setembro',
    highlight: { type: 'note', dot: 'negative', strong: 'Transporte', text: 'em 86% do teto' },
    quote: '“34 gastos pequenos somaram R$ 612 este mês.”',
    link: { label: 'Ver gastos', href: '/spending' },
  },
  pacu: {
    assistant: 'pacu',
    status: 'resumo na segunda',
    metric: { kind: 'money', value: cents(4_831_090) },
    metricCaption: 'na carteira de investimentos',
    highlight: {
      type: 'allocation',
      change: '+1,8%',
      text: 'no mês · CDI +0,9%',
      segments: PORTFOLIO_ALLOCATION,
    },
    quote: '“Na segunda eu mando o resumo da carteira.”',
    link: { label: 'Ver carteira', href: '/investments' },
  },
  caramelo: {
    assistant: 'caramelo',
    status: 'vigiando preços',
    metric: { kind: 'text', value: '3 alertas' },
    metricCaption: 'de preço ativos',
    highlight: {
      type: 'progress',
      strong: 'Bitcoin',
      text: 'a 5,4% do alvo de venda',
      percent: 82,
    },
    quote: '“Tô de guarda. Bateu no preço, eu lato.”',
    link: { label: 'Ver alertas', href: '/alerts' },
  },
  quero_quero: {
    assistant: 'quero_quero',
    status: '1 alerta',
    alert: true,
    metric: { kind: 'text', value: '1 compra' },
    metricCaption: 'fora do seu padrão',
    highlight: { type: 'alert', amount: cents(124_990), text: 'às 02:14 · 3,8x sua média' },
    quote: '“Teve uma compra estranha às 02:14. Foi você?”',
    link: { label: 'Revisar compra', href: '/alerts' },
  },
  onca: {
    assistant: 'onca',
    status: 'de olho nas metas',
    metric: { kind: 'text', value: '2 metas' },
    metricCaption: 'em andamento',
    highlight: { type: 'progress', strong: 'Viagem', text: 'em 62% da meta', percent: 62 },
    quote: '“Faltam R$ 3.800 para a viagem. No ritmo atual, chega em março.”',
    link: { label: 'Ver metas', href: '/investments/simulator/goal' },
  },
};

/** Cards on Início (the assistants with something to show this month). */
export const HOME_TEAM: AssistantId[] = ['tamandua', 'pacu', 'caramelo', 'quero_quero'];
