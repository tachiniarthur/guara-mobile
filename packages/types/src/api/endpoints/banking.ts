import { z } from 'zod';

import {
  BankAccountSchema,
  BankConnectionIdSchema,
  BankConnectionSchema,
  ConnectTokenSchema,
} from '../../domain';
import { defineEndpoints } from '../define';

const connectionParams = z.object({ connectionId: BankConnectionIdSchema });

/** Open Finance connections (Malvo) and their accounts. */
export const bankingEndpoints = defineEndpoints({
  'bankConnections.list': {
    method: 'GET',
    path: '/v1/bank-connections',
    summary: 'Connections with their accounts',
    response: z.array(BankConnectionSchema),
  },
  'bankConnections.get': {
    method: 'GET',
    path: '/v1/bank-connections/:connectionId',
    summary: 'One connection',
    params: connectionParams,
    response: BankConnectionSchema,
  },
  'bankConnections.connectToken': {
    method: 'POST',
    path: '/v1/bank-connections/connect-token',
    summary: 'Token to open the Malvo widget (new connection, or renewal when connectionId is set)',
    body: z.object({ connectionId: BankConnectionIdSchema.optional() }),
    response: ConnectTokenSchema,
  },
  'bankConnections.revoke': {
    method: 'POST',
    path: '/v1/bank-connections/:connectionId/revoke',
    summary: 'Revoke the Open Finance consent, keeping or deleting the imported history',
    params: connectionParams,
    body: z.object({ keepHistory: z.boolean() }),
    response: BankConnectionSchema,
  },
  'accounts.list': {
    method: 'GET',
    path: '/v1/accounts',
    summary: 'All accounts and cards of active connections',
    response: z.array(BankAccountSchema),
  },
});
