import { z } from 'zod';

/**
 * Fixed list of categories (what the user sees and caps: "Alimentação", "Eletrônicos"…).
 * The id doubles as a stable key across the app and the API.
 */
export const CATEGORY_IDS = [
  'housing',
  'bills',
  'food',
  'transport',
  'health',
  'education',
  'leisure',
  'shopping',
  'electronics',
  'home',
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

/**
 * Finer split inside a category ("Onde foi" of Alimentação). Optional: most categories have
 * none, and a transaction may have a category without a subcategory.
 */
export const SUBCATEGORY_IDS = ['restaurants', 'groceries', 'bakery'] as const;

export const SubcategoryIdSchema = z.enum(SUBCATEGORY_IDS);
export type SubcategoryId = z.infer<typeof SubcategoryIdSchema>;

/** Category each subcategory belongs to. */
export const SUBCATEGORY_PARENT = {
  restaurants: 'food',
  groceries: 'food',
  bakery: 'food',
} as const satisfies Record<SubcategoryId, CategoryId>;

/** `transfer` categories move money between the user's own places and are not spending. */
export const CategoryKindSchema = z.enum(['expense', 'income', 'transfer']);
export type CategoryKind = z.infer<typeof CategoryKindSchema>;

export const SubcategorySchema = z.object({
  id: SubcategoryIdSchema,
  /** pt-BR label, e.g. "Restaurantes e delivery". */
  label: z.string().min(1),
});
export type Subcategory = z.infer<typeof SubcategorySchema>;

export const CategorySchema = z.object({
  id: CategoryIdSchema,
  /** pt-BR label, e.g. "Alimentação". */
  label: z.string().min(1),
  /** Icon name in kebab case, e.g. "shopping-cart". */
  icon: z.string().regex(/^[a-z0-9-]+$/),
  kind: CategoryKindSchema,
  /** Empty when the category has no finer split. */
  subcategories: z.array(SubcategorySchema),
});
export type Category = z.infer<typeof CategorySchema>;
