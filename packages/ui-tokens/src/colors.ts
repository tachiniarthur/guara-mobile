/**
 * Dark theme palette (default and only theme for now).
 * Text colors are neutral; the brand accent comes from the maned wolf (lobo-guará) coat.
 *
 * Contrast rules (enforced by `__tests__/contrast.test.ts`):
 * - text tokens reach WCAG AA (4.5:1) on every background/surface they are used on;
 * - `*.solid` are filled backgrounds for buttons, paired with `*.foreground` text (AA);
 * - `*.muted` are tinted backgrounds for badges, paired with the `DEFAULT` text color (AA).
 */
export const colors = {
  background: {
    DEFAULT: '#0B0D10',
    elevated: '#14171C',
    sunken: '#07080A',
  },
  surface: {
    /** Cards and inputs. */
    DEFAULT: '#181C22',
    muted: '#1F242B',
    pressed: '#262C34',
  },
  border: {
    DEFAULT: '#2A3039',
    strong: '#3A424E',
    /** Focus ring of inputs and controls. */
    focus: '#E8743A',
  },
  foreground: {
    DEFAULT: '#F2F4F7',
    muted: '#A3ACB9',
    subtle: '#8A93A0',
    inverse: '#0B0D10',
  },
  /** Disabled controls (WCAG exempts disabled text from contrast requirements). */
  disabled: {
    background: '#1A1E24',
    foreground: '#5A626D',
  },
  brand: {
    /** Accent for text, icons and active states. */
    DEFAULT: '#E8743A',
    /** Filled background (primary button) — use with `brand.foreground`. */
    solid: '#B4481A',
    pressed: '#9C3E16',
    muted: '#33190D',
    foreground: '#FFFFFF',
  },
  /** Money in, buy. */
  positive: {
    DEFAULT: '#3FB37F',
    muted: '#10291D',
    foreground: '#0B0D10',
  },
  /** Money out, sell, destructive actions. */
  negative: {
    DEFAULT: '#F0626A',
    solid: '#B42A30',
    pressed: '#9A2328',
    muted: '#33161A',
    foreground: '#FFFFFF',
  },
  warning: {
    DEFAULT: '#F5A524',
    muted: '#33260F',
    foreground: '#0B0D10',
  },
  info: {
    DEFAULT: '#5B9BFF',
    muted: '#13233D',
    foreground: '#0B0D10',
  },
  /** Backdrop behind sheets and dialogs. */
  overlay: 'rgba(5, 6, 8, 0.72)',
  /** Skeleton placeholder shimmer base. */
  skeleton: '#232931',
  /** Categorical series for charts (keep order stable across the app). */
  chart: ['#5B9BFF', '#3FB37F', '#F5A524', '#E8743A', '#A77BF3', '#2EC4C4', '#F0626A'],
} as const;

export type Colors = typeof colors;
