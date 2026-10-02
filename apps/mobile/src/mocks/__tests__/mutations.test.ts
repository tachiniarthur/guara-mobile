import { resetMockData } from '..';

import { mockApi } from './helpers';

describe('mock mutations', () => {
  it('creates, updates and deletes a budget', async () => {
    const api = mockApi();
    const created = await api.request('budgets.create', {
      body: { categoryId: 'leisure', limit: 40_000, warningThresholds: [80] },
    });
    expect(created).toMatchObject({ categoryId: 'leisure', limit: 40_000, month: '2026-09' });
    expect((await api.request('budgets.list')).items).toHaveLength(5);

    await expect(
      api.request('budgets.create', {
        body: { categoryId: 'leisure', limit: 1_000, warningThresholds: [] },
      }),
    ).rejects.toMatchObject({ code: 'conflict', message: 'Já existe um teto para Lazer.' });

    const updated = await api.request('budgets.update', {
      params: { budgetId: created.id },
      body: { limit: 50_000 },
    });
    expect(updated.limit).toBe(50_000);

    await api.request('budgets.delete', { params: { budgetId: created.id } });
    expect((await api.request('budgets.list')).items).toHaveLength(4);
    await expect(
      api.request('budgets.get', { params: { budgetId: created.id } }),
    ).rejects.toMatchObject({
      code: 'not_found',
    });
  });

  it('correcting a category moves the amount between budgets', async () => {
    const api = mockApi();
    const before = await api.request('budgets.list');
    const spentOf = (list: typeof before, categoryId: string) =>
      list.items.find((budget) => budget.categoryId === categoryId)!.spent;
    const month = await api.request('transactions.list', {
      query: { period: 'this_month', categoryId: 'groceries', limit: 1 },
    });
    const tx = month.items[0]!;

    const corrected = await api.request('transactions.correctCategory', {
      params: { transactionId: tx.id },
      body: { categoryId: 'restaurants' },
    });
    expect(corrected).toMatchObject({
      autoCategoryId: 'groceries',
      userCategoryId: 'restaurants',
      categoryId: 'restaurants',
    });

    const after = await api.request('budgets.list');
    expect(spentOf(after, 'groceries')).toBe(spentOf(before, 'groceries') - tx.amount);
    expect(spentOf(after, 'restaurants')).toBe(spentOf(before, 'restaurants') + tx.amount);
  });

  it('resolves a duplicate by summing the positions', async () => {
    const api = mockApi();
    const before = await api.request('positions.list');
    const resolved = await api.request('duplicates.resolve', {
      params: { duplicateId: 'dup_petr4' },
      body: { resolution: 'sum' },
    });
    expect(resolved).toMatchObject({ status: 'resolved', resolution: 'sum' });

    const after = await api.request('positions.list');
    expect(after.items).toHaveLength(before.items.length - 1);
    expect(after.total).toBe(before.total);
    const petr4 = after.items.filter((p) => p.instrument.ticker === 'PETR4');
    expect(petr4).toHaveLength(1);
    expect(petr4[0]).toMatchObject({ quantity: '400', averagePrice: 3_108 });

    await expect(
      api.request('duplicates.resolve', {
        params: { duplicateId: 'dup_petr4' },
        body: { resolution: 'keep_separate' },
      }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });

  it('rejects deleting a position outside the duplicate pair', async () => {
    const api = mockApi();
    await expect(
      api.request('duplicates.resolve', {
        params: { duplicateId: 'dup_petr4' },
        body: { resolution: 'delete_one', deletePositionId: 'pos_btc' },
      }),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it('marks notifications as read and reset restores the scenario', async () => {
    const api = mockApi();
    const { count } = await api.request('notifications.unreadCount');
    await api.request('notifications.markAllRead');
    expect((await api.request('notifications.unreadCount')).count).toBe(0);
    resetMockData();
    expect((await api.request('notifications.unreadCount')).count).toBe(count);
  });

  it('streams a chat reply and stores both messages', async () => {
    const api = mockApi();
    const events: string[] = [];
    let text = '';
    await api.stream(
      'chat.sendMessage',
      {
        params: { conversationId: 'conv_spending' },
        body: { content: 'Como estão meus tetos de gasto?' },
      },
      {
        onEvent: (event) => {
          events.push(event.type);
          if (event.type === 'delta') text += event.text;
        },
      },
    );
    expect(events[0]).toBe('start');
    expect(events).toContain('card');
    expect(events.at(-1)).toBe('done');
    expect(text).toContain('teto mais apertado');
    const messages = await api.request('chat.listMessages', {
      params: { conversationId: 'conv_spending' },
    });
    expect(messages.items[0]).toMatchObject({ role: 'assistant', assistantId: 'tamandua' });
    expect(messages.items[1]).toMatchObject({ role: 'user' });
  });

  it('converts a goal simulation into a goal only once', async () => {
    const api = mockApi();
    const saved = await api.request('simulations.save', {
      body: {
        mode: 'goal',
        name: 'Carro novo',
        inputs: {
          targetAmount: 6_000_000,
          deadline: '2028-12-31',
          initialAmount: 500_000,
          annualReturn: 5,
        },
      },
    });
    expect(saved.result.requiredMonthlyContribution).toBeGreaterThan(0);
    expect(saved.result.reachedOn).not.toBeNull();
    const goal = await api.request('simulations.convertToGoal', {
      params: { simulationId: saved.id },
      body: {},
    });
    expect(goal).toMatchObject({ name: 'Carro novo', target: 6_000_000, simulationId: saved.id });
    await expect(
      api.request('simulations.convertToGoal', { params: { simulationId: saved.id }, body: {} }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });
});
