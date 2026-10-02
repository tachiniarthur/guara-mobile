import type { MockDb } from '../db';

/** Current instant of the fake world. */
export function nowIso(db: MockDb): string {
  return new Date(db.clock).toISOString();
}

/** Advances the clock (so mutations get increasing timestamps) and returns the new instant. */
export function touch(db: MockDb): string {
  db.clock += 1_000;
  return nowIso(db);
}

/** Id for records created at runtime: "bud_n101". */
export function nextId(db: MockDb, prefix: string): string {
  db.sequence += 1;
  return `${prefix}_n${db.sequence}`;
}

const DEFAULT_PAGE_SIZE = 20;

/** Offset-based cursor (opaque to the app). */
export function paginate<T>(items: readonly T[], cursor?: string, limit = DEFAULT_PAGE_SIZE) {
  const start = cursor ? Number(cursor) : 0;
  const offset = Number.isSafeInteger(start) && start > 0 ? start : 0;
  const end = offset + limit;
  return {
    items: items.slice(offset, end),
    nextCursor: end < items.length ? String(end) : null,
  };
}

/** Lower case without accents, for searches. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
