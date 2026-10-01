import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { toneColor, type Tone } from '@/theme/tones';

export interface SpinnerProps extends Omit<ActivityIndicatorProps, 'color'> {
  tone?: Tone;
  /** Override the tone with a token color (e.g. text color of a filled button). */
  color?: string;
}

/** Loading indicator in a token color. */
export function Spinner({ tone = 'muted', color, size = 'small', ...props }: SpinnerProps) {
  return (
    <ActivityIndicator
      size={size}
      color={color ?? toneColor[tone]}
      accessibilityLabel="Carregando"
      {...props}
    />
  );
}
