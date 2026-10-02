import { z } from 'zod';

/** Fixed list of categories. The id doubles as a stable key across the app and the API. */
export const CATEGORY_IDS = [
  'housing',
  'bills',
  'groceries',
  'restaurants',
  'transport',
  'health',
  'education',
  'leisure',
  'shopping',
  'subscriptions',
  'travel',
  'pets',
  'personal_care',
  'taxes',
  'transfers',
  'investments',
  'salary',
  'other_income',
  'other',
] as const;

export const CategoryIdSchema = z.enum(CATEGORY_IDS);
export type CategoryId = z.infer<typeof CategoryIdSchema>;

/** `transfer` categories move money between the user's own places and are not spending. */
export const CategoryKindSchema = z.enum(['expense', 'income', 'transfer']);
export type CategoryKind = z.infer<typeof CategoryKindSchema>;

export const CategorySchema = z.object({
  id: CategoryIdSchema,
  /** pt-BR label, e.g. "Restaurantes e delivery". */
  label: z.string().min(1),
  /** lucide-react-native icon name in kebab case, e.g. "shopping-cart". */
  icon: z.string().regex(/^[a-z0-9-]+$/),
  kind: CategoryKindSchema,
});
export type Category = z.infer<typeof CategorySchema>;
