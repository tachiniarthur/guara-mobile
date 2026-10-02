import type { EndpointName, StreamEndpointName } from '@guara/types';

import type { MockScenarioName } from '../config';
import type { MockDb } from '../db';
import type { MockFailure } from '../transport';

import { buildCompleteDb } from './complete';
import { buildNewUserDb } from './new-user';

export interface MockScenario {
  /** pt-BR, shown in the /dev/data panel. */
  label: string;
  /** One word for the segmented control. */
  shortLabel: string;
  description: string;
  build: () => MockDb;
  /** Endpoints that always fail in this scenario. */
  failures: Partial<Record<EndpointName | StreamEndpointName, MockFailure>>;
}

export const SCENARIOS: Record<MockScenarioName, MockScenario> = {
  complete: {
    label: 'Usuário completo',
    shortLabel: 'Completo',
    description: '3 bancos, 6 meses de lançamentos, carteira, metas, conversas e avisos.',
    build: () => buildCompleteDb(),
    failures: {},
  },
  new_user: {
    label: 'Usuário novo',
    shortLabel: 'Novo',
    description: 'Sem bancos, lançamentos nem carteira; perfil de investidor não respondido.',
    build: () => buildNewUserDb(),
    failures: {},
  },
  errors: {
    label: 'Erros',
    shortLabel: 'Erros',
    description:
      'Dados completos, mas vários endpoints falham (500, 503, 429, limite do plano e timeout).',
    build: () => buildCompleteDb(),
    failures: {
      'dashboard.get': { code: 'internal' },
      'budgets.list': { code: 'unavailable' },
      'transactions.list': 'timeout',
      'wealth.overview': { code: 'internal' },
      'notifications.list': { code: 'rate_limited' },
      'budgets.create': {
        code: 'plan_limit_reached',
        message: 'Seu plano permite até 4 tetos de gasto.',
      },
      'chat.sendMessage': {
        code: 'unavailable',
        message: 'Os assistentes estão indisponíveis agora.',
      },
    },
  },
};
