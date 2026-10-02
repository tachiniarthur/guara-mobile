import { accountEndpoints } from './endpoints/account';
import { bankingEndpoints } from './endpoints/banking';
import { chatEndpoints } from './endpoints/chat';
import { investmentEndpoints } from './endpoints/investments';
import { notificationEndpoints } from './endpoints/notifications';
import { overviewEndpoints } from './endpoints/overview';
import { planningEndpoints } from './endpoints/planning';
import { spendingEndpoints } from './endpoints/spending';
import type {
  EndpointParsedRequest,
  EndpointRequest,
  EndpointResponse,
  EndpointResponseInput,
  IsRequestOptional,
} from './define';

/**
 * Every JSON endpoint of the API, by name. The NestJS API implements this map and the app
 * calls it through `ApiTransport`; the mock transport must have one handler per entry.
 */
export const endpoints = {
  ...accountEndpoints,
  ...bankingEndpoints,
  ...spendingEndpoints,
  ...overviewEndpoints,
  ...investmentEndpoints,
  ...planningEndpoints,
  ...chatEndpoints,
  ...notificationEndpoints,
};

export type Endpoints = typeof endpoints;
export type EndpointName = keyof Endpoints;

export const ENDPOINT_NAMES = Object.keys(endpoints) as EndpointName[];

/** Request a client sends to `N`. */
export type ApiRequest<N extends EndpointName> = EndpointRequest<Endpoints[N]>;
/** Request after validation, as the server (or a mock handler) sees it. */
export type ApiParsedRequest<N extends EndpointName> = EndpointParsedRequest<Endpoints[N]>;
/** Parsed response of `N`. */
export type ApiResponse<N extends EndpointName> = EndpointResponse<Endpoints[N]>;
/** Response of `N` on the wire (unbranded), e.g. what a mock handler returns. */
export type ApiResponseInput<N extends EndpointName> = EndpointResponseInput<Endpoints[N]>;

/** Arguments after the endpoint name: the request is optional when nothing is required. */
export type ApiRequestArgs<N extends EndpointName, Extra = unknown> =
  IsRequestOptional<Endpoints[N]> extends true
    ? [request?: ApiRequest<N> & Extra]
    : [request: ApiRequest<N> & Extra];

/** Body a client sends to `N`. */
export type ApiBody<N extends EndpointName> = NonNullable<ApiRequest<N>['body']>;
/** Query a client sends to `N`. */
export type ApiQuery<N extends EndpointName> = NonNullable<ApiRequest<N>['query']>;
/** Path params a client sends to `N`. */
export type ApiParams<N extends EndpointName> = NonNullable<ApiRequest<N>['params']>;
