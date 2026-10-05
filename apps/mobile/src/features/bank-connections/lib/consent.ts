import type { IsoDate } from '@guara/types';
import { addMonths } from 'date-fns';

/** Last day of a consent given on `start` that lasts `months` ("até 23/09/2027"). */
export function consentEnd(start: IsoDate, months: number): IsoDate {
  const [year = 0, month = 1, day = 1] = start.split('-').map(Number);
  return addMonths(new Date(Date.UTC(year, month - 1, day, 12)), months)
    .toISOString()
    .slice(0, 10);
}
