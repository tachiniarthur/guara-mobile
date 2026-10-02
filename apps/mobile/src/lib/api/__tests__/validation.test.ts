import type { RawTransport } from '../transport';
import { ContractViolationError, createApiTransport } from '../validation';

const unreadCount = (payload: unknown): RawTransport => ({
  kind: 'mock',
  request: async () => payload,
  stream: async (_name, _request, { onEvent }) => onEvent(payload),
});

describe('response validation', () => {
  it('returns parsed data when the response follows the contract', async () => {
    const transport = createApiTransport(unreadCount({ count: 3, extra: 'dropped' }), {
      strict: true,
    });
    await expect(transport.request('notifications.unreadCount')).resolves.toEqual({ count: 3 });
  });

  it('fails loudly in development and tests', async () => {
    const transport = createApiTransport(unreadCount({ count: -1 }), { strict: true });
    await expect(transport.request('notifications.unreadCount')).rejects.toBeInstanceOf(
      ContractViolationError,
    );
    await expect(transport.request('notifications.unreadCount')).rejects.toThrow(
      'notifications.unreadCount',
    );
  });

  it('logs and keeps going in production', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const transport = createApiTransport(unreadCount({ count: 'três' }), { strict: false });
    await expect(transport.request('notifications.unreadCount')).resolves.toEqual({
      count: 'três',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'API response does not match the contract',
      expect.objectContaining({ endpoint: 'notifications.unreadCount' }),
    );
    consoleError.mockRestore();
  });

  it('validates every stream event', async () => {
    const transport = createApiTransport(unreadCount({ type: 'delta' }), { strict: true });
    await expect(
      transport.stream(
        'chat.sendMessage',
        { params: { conversationId: 'c1' }, body: { content: 'oi' } },
        { onEvent: () => {} },
      ),
    ).rejects.toBeInstanceOf(ContractViolationError);
  });
});
