/** Fictional institutions — no real bank names. */
import { addDays, instantAt } from '../clock';
import type { AccountRecord, ConnectionRecord } from '../db';

export const ACCOUNTS = {
  auroraChecking: 'acc_aurora_checking',
  auroraCard: 'acc_aurora_card',
  ipeSavings: 'acc_ipe_savings',
  jangadaChecking: 'acc_jangada_checking',
  jangadaCard: 'acc_jangada_card',
} as const;

export const INSTITUTIONS = {
  aurora: { id: 'inst_aurora', name: 'Banco Aurora', logoUrl: null },
  ipe: { id: 'inst_ipe', name: 'Banco Ipê', logoUrl: null },
  jangada: { id: 'inst_jangada', name: 'Banco Jangada', logoUrl: null },
} as const;

/** Three connections; Banco Jangada's consent expires in 6 days. */
export function buildBanks(today: string, nowIso: string) {
  const syncedAt = (hoursAgo: number) =>
    new Date(Date.parse(nowIso) - hoursAgo * 3_600_000).toISOString();

  const connections: ConnectionRecord[] = [
    {
      id: 'conn_aurora',
      institution: INSTITUTIONS.aurora,
      status: 'active',
      consentExpiresAt: instantAt('2027-03-10', '23:59'),
      lastSyncedAt: syncedAt(2),
      createdAt: instantAt('2026-03-14', '10:20'),
      updatedAt: syncedAt(2),
    },
    {
      id: 'conn_ipe',
      institution: INSTITUTIONS.ipe,
      status: 'active',
      consentExpiresAt: instantAt('2027-01-20', '23:59'),
      lastSyncedAt: syncedAt(3),
      createdAt: instantAt('2026-03-14', '10:31'),
      updatedAt: syncedAt(3),
    },
    {
      id: 'conn_jangada',
      institution: INSTITUTIONS.jangada,
      status: 'expiring',
      consentExpiresAt: instantAt(addDays(today, 6), '23:59'),
      lastSyncedAt: syncedAt(5),
      createdAt: instantAt('2025-10-01', '19:02'),
      updatedAt: syncedAt(5),
    },
  ];

  const account = (
    fields: Pick<
      AccountRecord,
      'id' | 'connectionId' | 'institutionId' | 'type' | 'name' | 'maskedNumber' | 'balance'
    > &
      Partial<AccountRecord>,
    hoursAgo: number,
  ): AccountRecord => ({
    currency: 'BRL',
    creditLimit: null,
    billDueOn: null,
    balanceUpdatedAt: syncedAt(hoursAgo),
    ...fields,
  });

  const accounts: AccountRecord[] = [
    account(
      {
        id: ACCOUNTS.auroraChecking,
        connectionId: 'conn_aurora',
        institutionId: INSTITUTIONS.aurora.id,
        type: 'checking',
        name: 'Conta corrente',
        maskedNumber: '•••• 4821',
        balance: 684_237,
      },
      2,
    ),
    account(
      {
        id: ACCOUNTS.auroraCard,
        connectionId: 'conn_aurora',
        institutionId: INSTITUTIONS.aurora.id,
        type: 'credit_card',
        name: 'Cartão Aurora Platinum',
        maskedNumber: '•••• 9034',
        balance: 287_455,
        creditLimit: 1_200_000,
        billDueOn: addDays(today, 15),
      },
      2,
    ),
    account(
      {
        id: ACCOUNTS.ipeSavings,
        connectionId: 'conn_ipe',
        institutionId: INSTITUTIONS.ipe.id,
        type: 'savings',
        name: 'Poupança',
        maskedNumber: '•••• 1177',
        balance: 1_523_000,
      },
      3,
    ),
    account(
      {
        id: ACCOUNTS.jangadaChecking,
        connectionId: 'conn_jangada',
        institutionId: INSTITUTIONS.jangada.id,
        type: 'checking',
        name: 'Conta digital',
        maskedNumber: '•••• 3360',
        balance: 121_590,
      },
      5,
    ),
    account(
      {
        id: ACCOUNTS.jangadaCard,
        connectionId: 'conn_jangada',
        institutionId: INSTITUTIONS.jangada.id,
        type: 'credit_card',
        name: 'Cartão Jangada',
        maskedNumber: '•••• 5512',
        balance: 64_210,
        creditLimit: 600_000,
        billDueOn: addDays(today, 10),
      },
      5,
    ),
  ];

  return { connections, accounts };
}
