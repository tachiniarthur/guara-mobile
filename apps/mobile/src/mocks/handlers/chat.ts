import type { AssistantId, StreamEndpoints } from '@guara/types';
import { formatCents } from '@guara/utils';
import type { z } from 'zod';

import { useMockConfig } from '../config';
import type { ConversationRecord, MessageRecord, MockDb } from '../db';
import { mockError, notFound } from '../errors';
import { categoryLabel } from '../fixtures/categories';
import { positionsWithShares } from '../logic/portfolio';
import { nextId, normalize, paginate, touch } from '../logic/records';
import { buildBudget, currentMonth } from '../logic/spending';
import { sleep } from '../transport';

import type { MockHandlers, MockStreamHandlers } from './types';

type Card = z.input<StreamEndpoints['chat.sendMessage']['event']> & { type: 'card' };
type Action = z.input<StreamEndpoints['chat.sendMessage']['event']> & { type: 'action' };

interface Reply {
  assistantId: AssistantId;
  text: string;
  cards: Card['block'][];
  actions: Action['action'][];
}

const ROUTES: [AssistantId, RegExp][] = [
  ['caramelo', /alerta|preco|avis/],
  ['quero_quero', /estranh|fora do padrao|golpe|nao reconhec/],
  ['onca', /meta|viagem|reserva|juntar/],
  ['pacu', /carteira|invest|acao|acoes|fii|rend|simul|aposent/],
  ['tamandua', /gast|teto|restaurante|mercado|conta|assinatura/],
];

/** Canned replies of the fake assistants, built from the scenario data. */
function replyTo(db: MockDb, content: string): Reply {
  const text = normalize(content);
  const assistantId = ROUTES.find(([, pattern]) => pattern.test(text))?.[0] ?? 'capivara';

  switch (assistantId) {
    case 'tamandua': {
      const budgets = db.budgets
        .map((record) => buildBudget(db, record, currentMonth(db)))
        .sort((a, b) => b.usedPercent - a.usedPercent);
      const top = budgets[0];
      if (!top) {
        return {
          assistantId,
          text: 'Você ainda não tem tetos de gasto. Que tal criar um para a categoria em que mais gasta?',
          cards: [],
          actions: [],
        };
      }
      return {
        assistantId,
        text: `O teto mais apertado agora é **${categoryLabel(top.categoryId)}**: ${formatCents(top.spent)} de ${formatCents(top.limit)}.`,
        cards: [
          {
            type: 'budget_bar',
            budgetId: top.id,
            categoryId: top.categoryId,
            limit: top.limit,
            spent: top.spent,
          },
        ],
        actions: [],
      };
    }
    case 'pacu': {
      const largest = positionsWithShares(db)[0];
      if (!largest) {
        return {
          assistantId,
          text: 'Ainda não encontrei investimentos. Conecte um banco ou cadastre uma posição manual.',
          cards: [],
          actions: [],
        };
      }
      return {
        assistantId,
        text: `Sua maior posição é **${largest.instrument.name}**. Isto não é recomendação de investimento.`,
        cards: [
          {
            type: 'position_summary',
            positionId: largest.id,
            ticker: largest.instrument.ticker,
            name: largest.instrument.name,
            currentValue: largest.currentValue,
            returnPercent: null,
            portfolioPercent: largest.portfolioPercent,
          },
        ],
        actions: largest.instrument.ticker
          ? [
              {
                type: 'open_asset',
                label: `Ver ${largest.instrument.ticker}`,
                ticker: largest.instrument.ticker,
              },
            ]
          : [],
      };
    }
    case 'caramelo':
      return {
        assistantId,
        text: 'Posso avisar quando **PETR4** passar de R$ 42,00. É só confirmar.',
        cards: [],
        actions: [
          {
            type: 'create_alert',
            label: 'Criar alerta de venda',
            ticker: 'PETR4',
            side: 'sell',
            targetPrice: 4_200,
          },
        ],
      };
    case 'quero_quero': {
      const pending = db.unusual.filter((record) => record.status === 'pending').length;
      return {
        assistantId,
        text: pending
          ? `Encontrei **${pending}** compra(s) fora do seu padrão esperando sua confirmação.`
          : 'Nenhuma compra fora do padrão no momento.',
        cards: [],
        actions: [],
      };
    }
    case 'onca': {
      const goals = db.goals.filter((goal) => goal.status === 'active');
      return {
        assistantId,
        text: goals.length
          ? `Você tem **${goals.length}** meta(s) ativa(s). A primeira é "${goals[0]!.name}".`
          : 'Você ainda não tem metas. Posso simular uma com você.',
        cards: [],
        actions: [],
      };
    }
    case 'capivara':
      return {
        assistantId,
        text: 'Posso ajudar com gastos, investimentos, alertas de preço, compras fora do padrão e metas. Sobre o que quer falar?',
        cards: [],
        actions: [],
      };
  }
}

function findConversation(db: MockDb, id: string) {
  const conversation = db.conversations.find((item) => item.id === id);
  if (!conversation) throw notFound('Conversa não encontrada.');
  return conversation;
}

export const chatHandlers = {
  'chat.listConversations': ({ query }, { db }) =>
    paginate(
      [...db.conversations].sort((a, b) =>
        (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt),
      ),
      query.cursor,
      query.limit,
    ),

  'chat.createConversation': ({ body }, { db }) => {
    const createdAt = touch(db);
    const conversation: ConversationRecord = {
      id: nextId(db, 'conv'),
      title: null,
      assistantId: body.assistantId ?? null,
      lastMessageAt: null,
      lastMessagePreview: null,
      createdAt,
      updatedAt: createdAt,
    };
    db.conversations.push(conversation);
    return conversation;
  },

  'chat.getConversation': ({ params }, { db }) => findConversation(db, params.conversationId),

  'chat.listMessages': ({ params, query }, { db }) => {
    findConversation(db, params.conversationId);
    return paginate(
      db.messages
        .filter((message) => message.conversationId === params.conversationId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      query.cursor,
      query.limit,
    );
  },
} satisfies Partial<MockHandlers<MockDb>>;

/** Streams a canned reply word by word, like the API relays Claude's stream. */
export const chatStreamHandlers = {
  'chat.sendMessage': async ({ params, body }, { db, emit, signal }) => {
    const conversation = findConversation(db, params.conversationId);
    if (db.aiMessagesThisMonth >= db.plan.limits.aiMessagesPerMonth) {
      throw mockError('plan_limit_reached', 'Você usou todas as mensagens de IA do mês.');
    }
    const userMessage: MessageRecord = {
      id: nextId(db, 'msg'),
      conversationId: conversation.id,
      role: 'user',
      assistantId: null,
      blocks: [{ type: 'text', text: body.content }],
      actions: [],
      createdAt: touch(db),
    };
    db.messages.push(userMessage);
    db.aiMessagesThisMonth += 1;

    const reply = replyTo(db, body.content);
    const messageId = nextId(db, 'msg');
    const pause = () => sleep(useMockConfig.getState().latencyMs > 0 ? 40 : 0, signal);

    await emit({
      type: 'start',
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      messageId,
      assistantId: reply.assistantId,
    });
    const words = reply.text.split(/(?<= )/);
    for (let index = 0; index < words.length; index += 3) {
      await pause();
      await emit({ type: 'delta', text: words.slice(index, index + 3).join('') });
    }
    for (const block of reply.cards) await emit({ type: 'card', block });
    for (const action of reply.actions) await emit({ type: 'action', action });

    const message: MessageRecord = {
      id: messageId,
      conversationId: conversation.id,
      role: 'assistant',
      assistantId: reply.assistantId,
      blocks: [{ type: 'text', text: reply.text }, ...reply.cards],
      actions: reply.actions,
      createdAt: touch(db),
    };
    db.messages.push(message);
    Object.assign(conversation, {
      title: conversation.title ?? body.content.slice(0, 40),
      assistantId: reply.assistantId,
      lastMessageAt: message.createdAt,
      lastMessagePreview: reply.text.replace(/\*\*/g, '').slice(0, 80),
      updatedAt: message.createdAt,
    });
    await emit({ type: 'done', message });
  },
} satisfies MockStreamHandlers<MockDb>;
