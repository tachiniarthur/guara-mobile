import { formatCents } from '@guara/utils';

import { addDays, instantAt } from '../clock';
import type { ConversationRecord, MessageRecord, MockDb } from '../db';
import { evolutionPoints, positionsWithShares } from '../logic/portfolio';
import { buildBudget, currentMonth, today as todayOf } from '../logic/spending';

/** Example conversations with rich cards, built from the scenario data so values match. */
export function buildChat(db: MockDb): {
  conversations: ConversationRecord[];
  messages: MessageRecord[];
} {
  const today = todayOf(db);
  const at = (daysAgo: number, time: string) => instantAt(addDays(today, -daysAgo), time);
  const restaurants = db.budgets.find((budget) => budget.categoryId === 'restaurants')!;
  const budget = buildBudget(db, restaurants, currentMonth(db));
  const petr4 = positionsWithShares(db).find((position) => position.id === 'pos_petr4_of')!;
  const evolution = evolutionPoints(db).slice(-6);

  const messages: MessageRecord[] = [
    {
      id: 'msg_spend_1',
      conversationId: 'conv_spending',
      role: 'user',
      assistantId: null,
      blocks: [{ type: 'text', text: 'Quanto já gastei com restaurantes este mês?' }],
      actions: [],
      createdAt: at(2, '20:14'),
    },
    {
      id: 'msg_spend_2',
      conversationId: 'conv_spending',
      role: 'assistant',
      assistantId: 'tamandua',
      blocks: [
        {
          type: 'text',
          text: `Você já usou **${budget.usedPercent.toFixed(0)}%** do teto de Restaurantes e delivery (${formatCents(budget.spent)} de ${formatCents(budget.limit)}). Quer criar também um teto para **Lazer**?`,
        },
        {
          type: 'budget_bar',
          budgetId: budget.id,
          categoryId: budget.categoryId,
          limit: budget.limit,
          spent: budget.spent,
        },
      ],
      actions: [
        {
          type: 'create_budget',
          label: 'Criar teto de Lazer',
          categoryId: 'leisure',
          limit: 40_000,
        },
      ],
      createdAt: at(2, '20:14'),
    },
    {
      id: 'msg_invest_1',
      conversationId: 'conv_investments',
      role: 'user',
      assistantId: null,
      blocks: [{ type: 'text', text: 'Como está minha posição em Petrobras?' }],
      actions: [],
      createdAt: at(4, '12:40'),
    },
    {
      id: 'msg_invest_2',
      conversationId: 'conv_investments',
      role: 'assistant',
      assistantId: 'pacu',
      blocks: [
        {
          type: 'text',
          text: 'Sua posição em **PETR4** está assim. Também separei a evolução da carteira nos últimos meses.',
        },
        {
          type: 'position_summary',
          positionId: petr4.id,
          ticker: 'PETR4',
          name: petr4.instrument.name,
          currentValue: petr4.currentValue,
          returnPercent:
            petr4.investedAmount && petr4.currentValue
              ? Math.round(
                  ((petr4.currentValue - petr4.investedAmount) / petr4.investedAmount) * 10_000,
                ) / 100
              : null,
          portfolioPercent: petr4.portfolioPercent,
        },
        {
          type: 'mini_chart',
          title: 'Carteira nos últimos 6 meses',
          points: evolution.map((point) => ({ date: point.date, value: point.value })),
        },
      ],
      actions: [{ type: 'open_asset', label: 'Ver PETR4', ticker: 'PETR4' }],
      createdAt: at(4, '12:41'),
    },
    {
      id: 'msg_alert_1',
      conversationId: 'conv_alerts',
      role: 'user',
      assistantId: null,
      blocks: [{ type: 'text', text: 'Me avisa se PETR4 passar de R$ 43?' }],
      actions: [],
      createdAt: at(6, '09:02'),
    },
    {
      id: 'msg_alert_2',
      conversationId: 'conv_alerts',
      role: 'assistant',
      assistantId: 'caramelo',
      blocks: [
        {
          type: 'text',
          text: 'Combinado! É só confirmar o alerta de **venda** abaixo. Lembre: isto não é recomendação de investimento.',
        },
      ],
      actions: [
        {
          type: 'create_alert',
          label: 'Criar alerta de venda',
          ticker: 'PETR4',
          side: 'sell',
          targetPrice: 4_300,
        },
      ],
      createdAt: at(6, '09:02'),
    },
  ];

  const conversation = (
    id: string,
    title: string,
    assistantId: ConversationRecord['assistantId'],
  ): ConversationRecord => {
    const own = messages.filter((message) => message.conversationId === id);
    const last = own[own.length - 1]!;
    const firstText = last.blocks.find((block) => block.type === 'text');
    return {
      id,
      title,
      assistantId,
      lastMessageAt: last.createdAt,
      lastMessagePreview:
        firstText && 'text' in firstText ? firstText.text.replace(/\*\*/g, '').slice(0, 80) : null,
      createdAt: own[0]!.createdAt,
      updatedAt: last.createdAt,
    };
  };

  return {
    conversations: [
      conversation('conv_spending', 'Gastos com restaurantes', 'tamandua'),
      conversation('conv_investments', 'Posição em Petrobras', 'pacu'),
      conversation('conv_alerts', 'Alerta para PETR4', 'caramelo'),
    ],
    // Newest first, as the API lists them.
    messages: messages.reverse(),
  };
}
