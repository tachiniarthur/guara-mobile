import {
  ENDPOINT_NAMES,
  buildPath,
  endpoints,
  streamEndpoints,
  type ApiParsedRequest,
  type ApiRequest,
  type ApiRequestArgs,
  type ApiResponse,
  type EndpointDef,
  type PathParams,
  type StreamEndpointDef,
} from '../index';

const allDefs: [string, EndpointDef | StreamEndpointDef][] = [
  ...Object.entries(endpoints),
  ...Object.entries(streamEndpoints),
];

function placeholders(path: string): string[] {
  return [...path.matchAll(/:([A-Za-z]+)/g)].map((match) => match[1]!).sort();
}

describe('API contract', () => {
  it.each(allDefs)('%s: path params match the params schema', (_, def) => {
    expect(def.path.startsWith('/v1/')).toBe(true);
    const declared = def.params ? Object.keys(def.params.shape).sort() : [];
    expect(declared).toEqual(placeholders(def.path));
  });

  it('method + path pairs are unique', () => {
    const routes = allDefs.map(([, def]) => `${def.method} ${def.path}`);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('GET and DELETE never take a body', () => {
    for (const [name, def] of Object.entries(endpoints) as [string, EndpointDef][]) {
      if (def.method === 'GET' || def.method === 'DELETE')
        expect([name, def.body]).toEqual([name, undefined]);
    }
  });

  it('exposes every endpoint name', () => {
    expect(ENDPOINT_NAMES).toHaveLength(Object.keys(endpoints).length);
    expect(ENDPOINT_NAMES).toContain('budgets.create');
  });

  it('builds paths with encoded params', () => {
    expect(buildPath('/v1/budgets/:budgetId', { budgetId: 'b/1' })).toBe('/v1/budgets/b%2F1');
    expect(() => buildPath('/v1/budgets/:budgetId')).toThrow('Missing path param "budgetId"');
  });
});

// --- Compile-time checks (tsc runs over this file) ------------------------------------------

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const assertType = <T extends true>(): T | undefined => undefined;

assertType<Equals<PathParams<'/v1/a/:id/b/:other'>, 'id' | 'other'>>();

// Requests use plain strings for branded ids; params are required when the path has them.
const detail: ApiRequest<'budgets.get'> = { params: { budgetId: 'bud_1' } };
// @ts-expect-error params are required
const missingParams: ApiRequest<'budgets.get'> = {};
// The request can be omitted when nothing is required, but not otherwise.
const noArgs: ApiRequestArgs<'dashboard.get'> = [];
// @ts-expect-error a body is required
const missingBody: ApiRequestArgs<'budgets.create'> = [];
// Parsed requests and responses carry branded types.
type ParsedBudgetId = ApiParsedRequest<'budgets.get'>['params']['budgetId'];
// @ts-expect-error a plain string is not a BudgetId
const plainId: ParsedBudgetId = 'bud_1';
type BudgetLimit = ApiResponse<'budgets.create'>['limit'];
// @ts-expect-error a plain number is not Cents
const plainLimit: BudgetLimit = 100;
assertType<Equals<ApiResponse<'budgets.delete'>, void>>();

void [detail, missingParams, noArgs, missingBody, plainId, plainLimit];
