import type { AssistantId } from '@guara/types';

/** Alertas as shown in the design (static until the API exists). */

export interface NoticeHistoryItem {
  id: string;
  assistant: AssistantId;
  title: string;
  detail: string;
  pending?: boolean;
}

export const NOTICE_HISTORY: NoticeHistoryItem[] = [
  {
    id: 'n1',
    assistant: 'quero_quero',
    title: 'Compra fora do padrão: R$ 1.249,90 em eletrônicos',
    detail: 'Hoje, 02:15 · celular e e-mail',
    pending: true,
  },
  {
    id: 'n2',
    assistant: 'tamandua',
    title: 'Alimentação chegou a R$ 700 (2º de 3 avisos)',
    detail: '21 set, 19:02 · celular',
  },
  {
    id: 'n3',
    assistant: 'tamandua',
    title: 'Transporte chegou a R$ 300 (1º de 2 avisos)',
    detail: '17 set, 08:41 · celular',
  },
];
