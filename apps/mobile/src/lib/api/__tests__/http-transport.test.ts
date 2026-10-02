import { ApiError } from '../errors';
import { createHttpTransport, toQueryString } from '../http-transport';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function setup(respond: (url: string, init: RequestInit) => Promise<Response>) {
  const fetchMock = jest.fn(respond);
  const transport = createHttpTransport({
    baseUrl: 'https://api.example.com',
    timeoutMs: 50,
    getHeaders: async () => ({ Authorization: 'Bearer token-123' }),
    fetch: fetchMock as unknown as typeof fetch,
  });
  return { transport, fetchMock };
}

describe('httpTransport', () => {
  it('builds the URL from the contract (path params and query) and sends auth', async () => {
    const { transport, fetchMock } = setup(async () => jsonResponse(200, { ok: true }));
    await expect(
      transport.request(
        'budgets.get',
        { params: { budgetId: 'bud 1' }, query: { month: '2026-09' } },
        {},
      ),
    ).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.example.com/v1/budgets/bud%201?month=2026-09');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(init.headers).toMatchObject({ Authorization: 'Bearer token-123' });
  });

  it('sends JSON bodies and resolves 204 as undefined', async () => {
    const { transport, fetchMock } = setup(async () => jsonResponse(204, null));
    await expect(
      transport.request('budgets.delete', { params: { budgetId: 'bud_1' } }, {}),
    ).resolves.toBeUndefined();
    await transport.request(
      'budgets.create',
      { body: { categoryId: 'groceries', limit: 100000, warningThresholds: [80] } },
      {},
    );
    const [, init] = fetchMock.mock.calls[1]!;
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body as string)).toMatchObject({ categoryId: 'groceries' });
  });

  it('maps a contract error body to ApiError', async () => {
    const { transport } = setup(async () =>
      jsonResponse(409, { code: 'conflict', message: 'Já existe um teto para Mercado.' }),
    );
    await expect(transport.request('dashboard.get', {}, {})).rejects.toMatchObject({
      name: 'ApiError',
      code: 'conflict',
      status: 409,
      message: 'Já existe um teto para Mercado.',
    });
  });

  it('maps unknown error bodies by status', async () => {
    const { transport } = setup(async () => jsonResponse(503, '<html>gateway</html>'));
    const error = await transport.request('dashboard.get', {}, {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'unavailable', status: 503, isRetryable: true });
  });

  it('turns fetch failures into network errors', async () => {
    const { transport } = setup(async () => {
      throw new TypeError('Network request failed');
    });
    await expect(transport.request('dashboard.get', {}, {})).rejects.toMatchObject({
      code: 'network',
      status: null,
    });
  });

  it('times out slow requests but lets caller aborts through', async () => {
    const hang = (_: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const fail = () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        };
        // Like the real fetch: an already aborted signal rejects right away.
        if (init.signal?.aborted) fail();
        init.signal?.addEventListener('abort', fail);
      });
    const { transport } = setup(hang);
    await expect(transport.request('dashboard.get', {}, {})).rejects.toMatchObject({
      code: 'timeout',
    });

    const controller = new AbortController();
    const pending = transport.request('dashboard.get', {}, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('serialises query values and skips empty ones', () => {
    expect(toQueryString({ a: 'x y', b: 2, c: true, d: undefined, e: null })).toBe(
      '?a=x%20y&b=2&c=true',
    );
    expect(toQueryString({})).toBe('');
  });
});
