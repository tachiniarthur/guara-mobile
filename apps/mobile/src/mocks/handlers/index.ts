import type { MockDb } from '../db';

import { accountHandlers } from './account';
import { bankingHandlers } from './banking';
import { chatHandlers, chatStreamHandlers } from './chat';
import { investmentHandlers } from './investments';
import { notificationHandlers } from './notifications';
import { overviewHandlers } from './overview';
import { planningHandlers } from './planning';
import { spendingHandlers } from './spending';
import type { MockHandlers, MockStreamHandlers } from './types';

/** One handler per endpoint of the contract — the compiler fails if one is missing. */
export const handlers = {
  ...accountHandlers,
  ...bankingHandlers,
  ...spendingHandlers,
  ...overviewHandlers,
  ...investmentHandlers,
  ...planningHandlers,
  ...chatHandlers,
  ...notificationHandlers,
} satisfies MockHandlers<MockDb>;

export const streamHandlers = chatStreamHandlers satisfies MockStreamHandlers<MockDb>;
