import type { MockDb } from '../db';
import { notFound, mockError } from '../errors';
import { nowIso, touch } from '../logic/records';

import type { MockHandlers } from './types';

function withAccounts(db: MockDb, connectionId: string) {
  const connection = db.connections.find((item) => item.id === connectionId);
  if (!connection) throw notFound('Conexão bancária não encontrada.');
  return {
    ...connection,
    accounts: db.accounts.filter((account) => account.connectionId === connectionId),
  };
}

export const bankingHandlers = {
  'bankConnections.list': (_request, { db }) =>
    db.connections.map((connection) => withAccounts(db, connection.id)),

  'bankConnections.get': ({ params }, { db }) => withAccounts(db, params.connectionId),

  'bankConnections.connectToken': ({ body }, { db }) => {
    if (body.connectionId) withAccounts(db, body.connectionId);
    else {
      const active = db.connections.filter((connection) => connection.status !== 'revoked').length;
      if (active >= db.plan.limits.bankConnections) {
        throw mockError(
          'plan_limit_reached',
          `Seu plano permite até ${db.plan.limits.bankConnections} bancos conectados.`,
        );
      }
    }
    db.sequence += 1;
    const token = `mock-connect-${db.sequence}`;
    return {
      widgetUrl: `https://widget.example.com/connect?token=${token}`,
      token,
      expiresAt: new Date(Date.parse(nowIso(db)) + 30 * 60_000).toISOString(),
    };
  },

  'bankConnections.revoke': ({ params }, { db }) => {
    const connection = db.connections.find((item) => item.id === params.connectionId);
    if (!connection) throw notFound('Conexão bancária não encontrada.');
    if (connection.status === 'revoked')
      throw mockError('conflict', 'Este consentimento já foi revogado.');
    connection.status = 'revoked';
    connection.updatedAt = touch(db);
    // Accounts of a revoked consent stop being read (history stays).
    db.accounts = db.accounts.filter((account) => account.connectionId !== connection.id);
    return withAccounts(db, connection.id);
  },

  'accounts.list': (_request, { db }) => db.accounts,
} satisfies Partial<MockHandlers<MockDb>>;
