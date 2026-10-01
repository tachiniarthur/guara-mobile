/** ISO-8601 timestamp string (UTC), e.g. "2026-10-01T12:00:00.000Z". */
export type ISODateTime = string;

/** Calendar date string without time, e.g. "2026-10-01". */
export type ISODate = string;

/** Opaque identifier issued by the API (UUID). */
export type Id = string;

/** Fields present on every persisted entity returned by the API. */
export interface Entity {
  id: Id;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Cursor-based page returned by list endpoints. */
export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}
