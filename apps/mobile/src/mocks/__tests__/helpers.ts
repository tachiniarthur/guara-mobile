import type { CategoryId } from '@guara/types';

import type { ApiTransport } from '@/lib/api/transport';
import { createApiTransport } from '@/lib/api/validation';

import {
  createMockTransport,
  resetMockData,
  setMockScenario,
  useMockConfig,
  type MockScenarioName,
} from '..';

/** Strict transport over the mocks (every response validated by the contract). */
export function mockApi(scenario: MockScenarioName = 'complete') {
  useMockConfig.setState({ latencyMs: 0, errorRate: 0, timeoutMs: 10 });
  setMockScenario(scenario);
  resetMockData();
  return createApiTransport(createMockTransport(), { strict: true });
}

const MONEY_KEY =
  /amount|balance|limit|spent|price|value|total|income|expenses|net|invested|debt|saved|target|contribut|revenue|ebitda|properties/i;

/** Every number under a money-like key (percentages excluded) must be an integer. */
export function fractionalMoney(value: unknown, path = '$'): string[] {
  if (Array.isArray(value))
    return value.flatMap((item, index) => fractionalMoney(item, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => {
      const here = `${path}.${key}`;
      if (typeof item === 'number' && MONEY_KEY.test(key) && !/percent|margin/i.test(key)) {
        return Number.isInteger(item) ? [] : [here];
      }
      return fractionalMoney(item, here);
    });
  }
  return [];
}

/** Walks every page of the transaction list through the cursor. */
export async function allTransactions(
  api: ApiTransport,
  query: { period?: 'this_month' | 'last_6_months'; categoryId?: CategoryId } = {},
) {
  const items = [];
  let cursor: string | undefined;
  do {
    const page = await api.request('transactions.list', {
      query: { ...query, cursor, limit: 100 },
    });
    items.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return items;
}
