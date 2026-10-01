/**
 * Minimum window widths (dp). Phone and tablet share the same features;
 * only the layout adapts.
 */
export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Maximum readable content width on large screens. */
export const contentMaxWidth = {
  phone: undefined,
  tablet: 720,
  desktop: 960,
} as const satisfies Record<Breakpoint, number | undefined>;
