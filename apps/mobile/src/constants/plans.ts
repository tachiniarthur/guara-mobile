import type { Cents } from '@guara/types';
import { cents } from '@guara/utils';

export type PlanId = 'essential' | 'complete' | 'extended';

export interface Plan {
  id: PlanId;
  name: string;
  /** Price per month and per year; `null` on the free plan. */
  monthly: Cents | null;
  yearly: Cents | null;
  bankLimit: number;
  /** "3 bancos", "8 bancos e corretoras". */
  banksLabel: string;
  /** Questions to the assistants per month. */
  questions: number;
  features: string[];
}

/** Plans of the design (Planos), from the cheapest. Prices come from the API later. */
export const PLANS: Plan[] = [
  {
    id: 'essential',
    name: 'Essencial',
    monthly: null,
    yearly: null,
    bankLimit: 1,
    banksLabel: '1 banco',
    questions: 30,
    features: [
      'Gastos, tetos e assinaturas',
      'Até 3 alertas de preço',
      'Relatório do mês, sem exportação',
      'Atualização 2 vezes ao dia',
    ],
  },
  {
    id: 'complete',
    name: 'Completo',
    monthly: cents(1990),
    yearly: cents(19_900),
    bankLimit: 3,
    banksLabel: '3 bancos',
    questions: 300,
    features: [
      'Tudo do Essencial',
      'Investimentos completos e página de cada ativo',
      'Alertas de preço sem limite',
      'Relatórios com exportação em PDF, Excel e CSV',
      'Simulador e metas',
    ],
  },
  {
    id: 'extended',
    name: 'Ampliado',
    monthly: cents(3490),
    yearly: cents(34_900),
    bankLimit: 8,
    banksLabel: '8 bancos e corretoras',
    questions: 1000,
    features: ['Tudo do Completo', 'Atualização a cada 2 horas', 'Suporte prioritário'],
  },
];

export const planById = (id: PlanId): Plan => PLANS.find((plan) => plan.id === id)!;

/** "Comparar recursos" (tablet): one value per plan, in the order of `PLANS`. */
export const PLAN_COMPARISON: { label: string; values: [string, string, string] }[] = [
  { label: 'Bancos conectados', values: ['1', '3', '8 bancos e corretoras'] },
  { label: 'Perguntas aos assistentes', values: ['30/mês', '300/mês', '1.000/mês'] },
  { label: 'Investimentos e página do ativo', values: ['—', 'Sim', 'Sim'] },
  { label: 'Alertas de preço', values: ['Até 3', 'Sem limite', 'Sem limite'] },
  { label: 'Exportar relatórios', values: ['—', 'PDF, Excel e CSV', 'PDF, Excel e CSV'] },
  {
    label: 'Atualização dos bancos',
    values: ['2 vezes ao dia', 'Várias vezes ao dia', 'A cada 2 horas'],
  },
  { label: 'Simulador e metas', values: ['—', 'Sim', 'Sim'] },
  { label: 'Suporte', values: ['E-mail', 'E-mail', 'Prioritário'] },
];
