/**
 * Building blocks of the REST contract shared by the app and the future NestJS API.
 *
 * Each endpoint declares its method, `/v1/...` path (`:name` placeholders), and zod schemas
 * for path params, query, body and response. Endpoints are addressed by a stable name
 * (`'budgets.list'`), which the app transports and the mock handlers use as key.
 */
import { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface EndpointDef {
  method: HttpMethod;
  /** Path with `:param` placeholders, e.g. "/v1/budgets/:budgetId". */
  path: `/v1/${string}`;
  /** Short description (English) for the generated docs/Swagger. */
  summary: string;
  params?: z.ZodObject;
  /** Query values are strings over HTTP; the API coerces before validating. */
  query?: z.ZodObject;
  body?: z.ZodType;
  /** `NoContentSchema` for 204 responses. */
  response: z.ZodType;
}

/** Response of endpoints that answer `204 No Content`. */
export const NoContentSchema = z.void();

/** Keeps literal types (method, path) while checking each entry against `EndpointDef`. */
export function defineEndpoints<const T extends Record<string, EndpointDef>>(endpoints: T): T {
  return endpoints;
}

// --- Type helpers ----------------------------------------------------------------------------

type Simplify<T> = { [K in keyof T]: T[K] } & {};

/** Optional when every field of the schema is optional; absent when there is no schema. */
type RequestPart<Key extends string, Schema, Mode extends 'input' | 'output'> = [Schema] extends [
  never,
]
  ? { [P in Key]?: undefined }
  : Schema extends z.ZodType
    ? Mode extends 'input'
      ? object extends z.input<Schema>
        ? { [P in Key]?: z.input<Schema> }
        : { [P in Key]: z.input<Schema> }
      : { [P in Key]: z.output<Schema> }
    : never;

type SchemaOf<E, Key extends 'params' | 'query' | 'body'> = E extends {
  [P in Key]: infer Schema extends z.ZodType;
}
  ? Schema
  : never;

type RequestOf<E, Mode extends 'input' | 'output'> = Simplify<
  RequestPart<'params', SchemaOf<E, 'params'>, Mode> &
    RequestPart<'query', SchemaOf<E, 'query'>, Mode> &
    RequestPart<'body', SchemaOf<E, 'body'>, Mode>
>;

/** What a client sends: `{ params?, query?, body? }` (plain strings for branded ids). */
export type EndpointRequest<E extends EndpointDef> = RequestOf<E, 'input'>;

/** What a server receives after validation (branded ids, all parts present). */
export type EndpointParsedRequest<E extends EndpointDef> = RequestOf<E, 'output'>;

/** Parsed response (branded types). */
export type EndpointResponse<E extends EndpointDef> = z.output<E['response']>;

/** Response as it travels on the wire, before validation. */
export type EndpointResponseInput<E extends EndpointDef> = z.input<E['response']>;

/** `true` when the request object can be omitted entirely. */
export type IsRequestOptional<E extends EndpointDef> =
  object extends EndpointRequest<E> ? true : false;

/** Placeholders of a path: PathParams<'/v1/a/:id/b/:x'> = 'id' | 'x'. */
export type PathParams<Path extends string> = Path extends `${string}:${infer Param}/${infer Rest}`
  ? Param | PathParams<`/${Rest}`>
  : Path extends `${string}:${infer Param}`
    ? Param
    : never;

/** Replaces `:param` placeholders with URL-encoded values. */
export function buildPath(path: string, params: Record<string, string> = {}): string {
  return path.replace(/:([A-Za-z]+)/g, (_, name: string) => {
    const value = params[name];
    if (value === undefined || value === '') throw new Error(`Missing path param "${name}"`);
    return encodeURIComponent(value);
  });
}
