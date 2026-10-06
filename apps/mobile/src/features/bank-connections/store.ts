import type { IsoDate } from '@guara/types';
import { create } from 'zustand';

import { BANK_CONNECTIONS, SUPPORTED_BANKS, type BankConnection } from './data';

interface BankConnectionsState {
  connections: BankConnection[];
  /** A new consent finished in the Malvo. */
  connect: (bankId: string, authorizedUntil: IsoDate) => void;
  /** The consent of a connected bank was renewed. */
  renew: (bankId: string, authorizedUntil: IsoDate) => void;
  disconnect: (bankId: string) => void;
  reset: () => void;
}

/**
 * Connected banks. Local until the API exists; then `connect`/`renew` come from the Malvo
 * callback and `disconnect` becomes `bankConnections.revoke`.
 */
export const useBankConnectionsStore = create<BankConnectionsState>()((set) => ({
  connections: BANK_CONNECTIONS,
  connect: (bankId, authorizedUntil) =>
    set(({ connections }) => {
      const bank = SUPPORTED_BANKS.find((item) => item.id === bankId);
      if (!bank) return {};
      // A paused bank (over the plan limit) comes back when connected again.
      if (connections.some((item) => item.id === bankId)) {
        return {
          connections: connections.map((item) =>
            item.id === bankId
              ? { ...item, status: 'ok', authorizedUntil, updatedAt: 'Agora' }
              : item,
          ),
        };
      }
      return {
        connections: [
          ...connections,
          {
            id: bank.id,
            name: bank.name,
            initial: bank.mark,
            status: 'ok',
            scopes: ['Conta', 'Cartão de crédito', 'Investimentos'],
            updatedAt: 'Agora',
            authorizedUntil,
          },
        ],
      };
    }),
  renew: (bankId, authorizedUntil) =>
    set(({ connections }) => ({
      connections: connections.map((item) =>
        item.id === bankId ? { ...item, status: 'ok', authorizedUntil, updatedAt: 'Agora' } : item,
      ),
    })),
  disconnect: (bankId) =>
    set(({ connections }) => ({ connections: connections.filter((item) => item.id !== bankId) })),
  reset: () => set({ connections: BANK_CONNECTIONS }),
}));
