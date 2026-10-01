import type { Entity, ISODate } from './common';
import type { Cents } from './money';

export type GoalStatus = 'active' | 'achieved' | 'archived';

export interface Goal extends Entity {
  name: string;
  target: Cents;
  saved: Cents;
  deadline: ISODate | null;
  status: GoalStatus;
}
