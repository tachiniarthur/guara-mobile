/** Corner radii in dp, named by value as in the design (`rounded-24` = card). */
export const radius = {
  none: 0,
  2: 2,
  4: 4,
  5: 5,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  22: 22,
  24: 24,
  28: 28,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
