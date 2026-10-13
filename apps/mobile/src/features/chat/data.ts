import type { AssistantId, Cents } from '@guara/types';
import { cents } from '@guara/utils';

/** Inline text with bold runs: "você gastou **R$ 742,18** em…". */
export type RichText = readonly (string | { strong: string })[];

export type AssistantBlock =
  | { type: 'text'; content: RichText }
  | {
      type: 'budget';
      label: string;
      spent: Cents;
      limit: Cents;
      milestones: Cents[];
    };

/** A file sent with a question (PDF or photo, up to 10 MB). */
export interface ChatFile {
  uri: string;
  name: string;
  kind: 'pdf' | 'image';
  /** Bytes; `null` when the system does not say. */
  sizeBytes: number | null;
}

export type ChatMessage =
  | {
      id: string;
      role: 'user';
      text: string;
      attachment?: ChatFile;
      /** `failed`: not sent (no connection); it stays until "Tentar de novo" or "Apagar". */
      status?: 'failed';
    }
  | {
      id: string;
      role: 'assistant';
      assistant: AssistantId;
      area: string;
      blocks: AssistantBlock[];
      /** `streaming` while it is written; `stopped` when "Parar a resposta" cut it. */
      status?: 'streaming' | 'stopped';
      /** The Capivara called this assistant ("A Capivara chamou o Pacu"). */
      routedBy?: AssistantId;
    }
  | {
      id: string;
      /** The assistant did not answer; the question waits to be asked again. */
      role: 'unavailable';
      assistant: AssistantId;
      area: string;
      /** The user message it answers. */
      questionId: string;
      routedBy?: AssistantId;
    };

export interface Conversation {
  id: string;
  title: string;
  /** "Hoje, 14:32". */
  updatedLabel: string;
  messages: ChatMessage[];
}

/** The conversation shown in the design (static until the chat API exists). */
export const CONVERSATION: Conversation = {
  id: 'gastos-de-setembro',
  title: 'Gastos de setembro',
  updatedLabel: 'Hoje, 14:32',
  messages: [
    { id: 'm1', role: 'user', text: 'quanto gastei com comida esse mês?' },
    {
      id: 'm2',
      role: 'assistant',
      assistant: 'tamandua',
      area: 'Gastos',
      blocks: [
        {
          type: 'text',
          content: [
            'Farejei tudo: você gastou ',
            { strong: 'R$ 742,18' },
            ' em Alimentação, 74% do teto de R$ 1.000. Os avisos de R$ 500 e R$ 700 já foram enviados.',
          ],
        },
        {
          type: 'budget',
          label: 'Alimentação · setembro',
          spent: cents(74_218),
          limit: cents(100_000),
          milestones: [cents(50_000), cents(70_000)],
        },
        {
          type: 'text',
          content: ['No ritmo atual, você fecha o mês perto de ', { strong: 'R$ 960' }, '.'],
        },
      ],
    },
    { id: 'm3', role: 'user', text: 'e assinaturas?' },
    {
      id: 'm4',
      role: 'assistant',
      assistant: 'tamandua',
      area: 'Gastos',
      blocks: [
        {
          type: 'text',
          content: [
            'São 4 ativas, somando ',
            { strong: 'R$ 101,60/mês' },
            '. O Amazon Prime não teve uso ligado a compras nos últimos 60 dias.',
          ],
        },
      ],
    },
  ],
};

export const SUGGESTIONS = ['Cancelar o Amazon Prime', 'Resumo da semana', 'Como está meu saldo?'];

/** "Comece por aqui" of a new conversation: a question for each assistant. */
export const STARTERS: { assistant: AssistantId; question: string }[] = [
  { assistant: 'tamandua', question: 'Quanto gastei com comida em setembro?' },
  { assistant: 'pacu', question: 'Minha carteira está no meu perfil?' },
  { assistant: 'caramelo', question: 'Me avisa se o Bitcoin passar de R$ 650.000' },
  { assistant: 'onca', question: 'Quanto falta para a reserva de emergência?' },
];

/** An answer the design shows in full, by question (stand-in for the chat API). */
export interface ScriptedReply {
  questions: readonly string[];
  assistant: AssistantId;
  area: string;
  blocks: AssistantBlock[];
}

const FOOD_ANSWER = CONVERSATION.messages[1] as Extract<ChatMessage, { role: 'assistant' }>;
const SUBSCRIPTIONS_ANSWER = CONVERSATION.messages[3] as Extract<
  ChatMessage,
  { role: 'assistant' }
>;

export const SCRIPTED_REPLIES: ScriptedReply[] = [
  {
    questions: ['quanto gastei com comida esse mês?', 'Quanto gastei com comida em setembro?'],
    assistant: FOOD_ANSWER.assistant,
    area: FOOD_ANSWER.area,
    blocks: FOOD_ANSWER.blocks,
  },
  {
    questions: ['e assinaturas?'],
    assistant: SUBSCRIPTIONS_ANSWER.assistant,
    area: SUBSCRIPTIONS_ANSWER.area,
    blocks: SUBSCRIPTIONS_ANSWER.blocks,
  },
  {
    questions: ['consegue ler meu extrato do Itaú?'],
    assistant: 'capivara',
    area: 'Coordena a turma',
    blocks: [
      {
        type: 'text',
        content: [
          'Consigo, sim. Mande o PDF, a foto ou a imagem do extrato (até 10 MB) e eu passo para o Tamanduá.',
        ],
      },
    ],
  },
];

export interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
  time: string;
  /** "Fixar no topo": shown first in the history. */
  pinned?: boolean;
}

export type ConversationGroup = { label: string; items: ConversationSummary[] };

export const CONVERSATION_GROUPS: ConversationGroup[] = [
  {
    label: 'Hoje',
    items: [
      {
        id: 'gastos-de-setembro',
        title: 'Gastos de setembro',
        preview: 'Você gastou R$ 742,18 em Alimentação',
        time: '14:32',
      },
      {
        id: 'aposentadoria-aos-55',
        title: 'Aposentadoria aos 55',
        preview: 'Aporte necessário: R$ 5.640/mês',
        time: '14:40',
      },
    ],
  },
  {
    label: 'Esta semana',
    items: [
      {
        id: 'alerta-bitcoin',
        title: 'Alerta do Bitcoin',
        preview: 'BTC a 5,4% do alvo de venda',
        time: 'seg',
      },
      {
        id: 'compra-madrugada',
        title: 'Compra de madrugada',
        preview: 'R$ 1.249,90 em eletrônicos',
        time: 'dom',
      },
      {
        id: 'cortar-uber',
        title: 'Cortar Uber no emprego novo',
        preview: 'Economia estimada de R$ 312/mês',
        time: 'sáb',
      },
    ],
  },
  {
    label: 'Agosto',
    items: [
      {
        id: 'rebalancear',
        title: 'Rebalancear a carteira',
        preview: 'Renda fixa acima do alvo',
        time: '28 ago',
      },
      {
        id: 'viajar',
        title: 'Quanto sobra para viajar?',
        preview: 'Sobra média de R$ 1.900/mês',
        time: '19 ago',
      },
    ],
  },
];

/** History with the pinned conversations first ("Fixadas"); empty groups are left out. */
export function historyGroups(groups: readonly ConversationGroup[]): ConversationGroup[] {
  const pinned = groups.flatMap((group) => group.items.filter((item) => item.pinned));
  const rest = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.pinned) }))
    .filter((group) => group.items.length > 0);
  return pinned.length > 0 ? [{ label: 'Fixadas', items: pinned }, ...rest] : rest;
}

export const countConversations = (groups: readonly ConversationGroup[]) =>
  groups.reduce((total, group) => total + group.items.length, 0);

/** Assistants offered in "Falar com um bicho" (the Capivara routes by default). */
export const PICKABLE_ASSISTANTS: { id: AssistantId; label: string }[] = [
  { id: 'pacu', label: 'Investimentos e simulações' },
  { id: 'caramelo', label: 'Alertas de preço' },
  { id: 'tamandua', label: 'Organização de gastos' },
  { id: 'quero_quero', label: 'Compras fora do padrão' },
  { id: 'onca', label: 'Metas e objetivos' },
];
