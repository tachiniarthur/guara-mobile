import { ApiError } from '@/lib/api/errors';

import { createMockTransport, type MockTransportOptions } from '../transport';

type Options = MockTransportOptions<{ count: number }>;

function setup(overrides: Partial<Options> = {}) {
  const config = { latencyMs: 0, errorRate: 0, timeoutMs: 20 };
  const transport = createMockTransport<{ count: number }>({
    handlers: {
      'notifications.unreadCount': (_request, { db }) => ({ count: db.count }),
      'budgets.get': ({ params }) => {
        throw new ApiError('not_found', `Teto ${params.budgetId} não encontrado.`, 404);
      },
      'budgets.create': ({ body }) => ({ received: body }) as never,
    },
    getConfig: () => config,
    getContext: () => ({ db: { count: 2 }, now: new Date('2026-09-25T15:00:00Z') }),
    ...overrides,
  });
  return { transport, config };
}

describe('mockTransport', () => {
  it('resolves endpoints with in-memory handlers', async () => {
    const { transport } = setup();
    await expect(transport.request('notifications.unreadCount', {}, {})).resolves.toEqual({
      count: 2,
    });
  });

  it('validates requests like the API (422)', async () => {
    const { transport } = setup();
    await expect(
      transport.request('budgets.create', { body: { categoryId: 'nope', limit: 10.5 } }, {}),
    ).rejects.toMatchObject({ code: 'validation_failed', status: 422 });
  });

  it('passes parsed requests and propagates ApiError from handlers', async () => {
    const { transport } = setup();
    await expect(
      transport.request('budgets.get', { params: { budgetId: 'b9' } }, {}),
    ).rejects.toMatchObject({ code: 'not_found', message: 'Teto b9 não encontrado.' });
  });

  it('answers not_found for endpoints without a handler', async () => {
    const { transport } = setup();
    await expect(transport.request('dashboard.get', {}, {})).rejects.toMatchObject({
      code: 'not_found',
    });
  });

  it('applies the error rate', async () => {
    const { transport, config } = setup({ random: () => 0.1 });
    config.errorRate = 0.2;
    await expect(transport.request('notifications.unreadCount', {}, {})).rejects.toMatchObject({
      code: 'unavailable',
      status: 503,
    });
    config.errorRate = 0.05;
    await expect(transport.request('notifications.unreadCount', {}, {})).resolves.toEqual({
      count: 2,
    });
  });

  it('applies scenario failures, including timeouts', async () => {
    const { transport } = setup({
      getFailure: (name) =>
        name === 'dashboard.get'
          ? { code: 'internal' }
          : name === 'budgets.get'
            ? 'timeout'
            : undefined,
    });
    await expect(transport.request('dashboard.get', {}, {})).rejects.toMatchObject({
      code: 'internal',
      status: 500,
    });
    await expect(
      transport.request('budgets.get', { params: { budgetId: 'b1' } }, {}),
    ).rejects.toMatchObject({ code: 'timeout', status: null });
  });

  it('adds latency and can be aborted while waiting', async () => {
    const { transport, config } = setup();
    config.latencyMs = 1_000;
    const controller = new AbortController();
    const pending = transport.request(
      'notifications.unreadCount',
      {},
      { signal: controller.signal },
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
