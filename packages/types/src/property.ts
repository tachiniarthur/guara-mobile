import type { Entity } from './common';
import type { Cents } from './money';

export type PropertyKind = 'real_estate' | 'vehicle';

interface PropertyBase extends Entity {
  kind: PropertyKind;
  name: string;
  estimatedValue: Cents | null;
}

export interface RealEstate extends PropertyBase {
  kind: 'real_estate';
  address: string | null;
}

export interface Vehicle extends PropertyBase {
  kind: 'vehicle';
  /** FIPE table code used to estimate the value. */
  fipeCode: string | null;
  modelYear: number | null;
}

export type Property = RealEstate | Vehicle;
