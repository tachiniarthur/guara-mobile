/**
 * Dark theme palette (default and only theme for now).
 * Text colors are neutral; the brand accent comes from the maned wolf (lobo-guará) coat.
 */
export const colors = {
  background: {
    DEFAULT: '#0B0D10',
    elevated: '#14171C',
    sunken: '#07080A',
  },
  surface: {
    DEFAULT: '#181C22',
    muted: '#1F242B',
    pressed: '#262C34',
  },
  border: {
    DEFAULT: '#2A3039',
    strong: '#3A424E',
  },
  foreground: {
    DEFAULT: '#F2F4F7',
    muted: '#A3ACB9',
    subtle: '#6B7480',
    inverse: '#0B0D10',
  },
  brand: {
    DEFAULT: '#D9622B',
    muted: '#8A3F1D',
    foreground: '#FFFFFF',
  },
  positive: '#3FB37F',
  negative: '#E5484D',
  warning: '#F5A524',
  info: '#4C8DF6',
  /** Categorical series for charts (keep order stable across the app). */
  chart: ['#4C8DF6', '#3FB37F', '#F5A524', '#D9622B', '#A77BF3', '#2EC4C4', '#E5484D'],
} as const;

export type Colors = typeof colors;
