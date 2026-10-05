import { colors } from '@guara/ui-tokens';

/** Semantic text/icon tones shared by components. */
export type Tone =
  | 'default'
  | 'soft'
  | 'muted'
  | 'subtle'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info'
  | 'brand'
  | 'inverse';

/**
 * Raw token colors per tone, for props that do not accept classes (Lucide icons,
 * ActivityIndicator, Switch). In JSX prefer the NativeWind classes.
 */
export const toneColor: Record<Tone, string> = {
  default: colors.foreground.DEFAULT,
  soft: colors.foreground.soft,
  muted: colors.foreground.muted,
  subtle: colors.foreground.subtle,
  positive: colors.positive.DEFAULT,
  negative: colors.negative.DEFAULT,
  warning: colors.warning.DEFAULT,
  info: colors.info.DEFAULT,
  brand: colors.brand.DEFAULT,
  inverse: colors.foreground.inverse,
};

/** Tone for a signed amount: positive (in), negative (out) or neutral. */
export function toneForSign(value: number, invert = false): Tone {
  if (value === 0) return 'default';
  const isUp = value > 0 !== invert;
  return isUp ? 'positive' : 'negative';
}
