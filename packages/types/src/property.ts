/** Properties ("bens"). They count towards net worth but stay OUT of the investment allocation. */
import { z } from 'zod';

import { YearMonthSchema, timestamps } from './common';
import { PropertyIdSchema } from './ids';
import { CentsSchema, NonNegativeCentsSchema, PositiveCentsSchema } from './money';

export const PropertyKindSchema = z.enum(['real_estate', 'vehicle']);
export type PropertyKind = z.infer<typeof PropertyKindSchema>;

/** FIPE table code, e.g. "005340-6". */
export const FipeCodeSchema = z.string().regex(/^\d{6}-\d$/, 'Expected a FIPE code like 005340-6');

export const RealEstateSchema = z.object({
  id: PropertyIdSchema,
  kind: z.literal('real_estate'),
  name: z.string().min(1),
  /** Value informed by the user. */
  declaredValue: NonNegativeCentsSchema,
  /** Remaining financing balance. */
  outstandingDebt: NonNegativeCentsSchema.nullable(),
  address: z.string().min(1).nullable(),
  ...timestamps,
});
export type RealEstate = z.infer<typeof RealEstateSchema>;

export const VehicleSchema = z.object({
  id: PropertyIdSchema,
  kind: z.literal('vehicle'),
  name: z.string().min(1),
  fipeCode: FipeCodeSchema,
  /** Value from the FIPE table, refreshed monthly by the API. */
  fipeValue: NonNegativeCentsSchema.nullable(),
  fipeReferenceMonth: YearMonthSchema.nullable(),
  modelYear: z.int().min(1950).max(2100).nullable(),
  outstandingDebt: NonNegativeCentsSchema.nullable(),
  ...timestamps,
});
export type Vehicle = z.infer<typeof VehicleSchema>;

export const PropertySchema = z.discriminatedUnion('kind', [RealEstateSchema, VehicleSchema]);
export type Property = z.infer<typeof PropertySchema>;

export const PropertyListSchema = z.object({
  items: z.array(PropertySchema),
  totalValue: NonNegativeCentsSchema,
  totalDebt: NonNegativeCentsSchema,
  /** totalValue − totalDebt */
  net: CentsSchema,
});
export type PropertyList = z.infer<typeof PropertyListSchema>;

export const CreateRealEstateBodySchema = z.object({
  name: z.string().min(1).max(80),
  declaredValue: PositiveCentsSchema,
  outstandingDebt: NonNegativeCentsSchema.nullable(),
  address: z.string().min(1).max(200).nullable(),
});
export type CreateRealEstateBody = z.infer<typeof CreateRealEstateBodySchema>;

export const CreateVehicleBodySchema = z.object({
  name: z.string().min(1).max(80),
  fipeCode: FipeCodeSchema,
  modelYear: z.int().min(1950).max(2100),
  outstandingDebt: NonNegativeCentsSchema.nullable(),
});
export type CreateVehicleBody = z.infer<typeof CreateVehicleBodySchema>;
