import { View } from 'react-native';

import { cn } from '@/lib/cn';

export type ProgressState = 'normal' | 'warning' | 'over';

/**
 * State of a progress value against its limit:
 * - `over` when the value exceeds the limit;
 * - `warning` when it reaches `warnAt` (fraction of the limit) or the last marker;
 * - `normal` otherwise.
 */
export function getProgressState(
  value: number,
  max: number,
  { warnAt = 0.8, markers = [] }: { warnAt?: number; markers?: readonly number[] } = {},
): ProgressState {
  if (max <= 0) return value > 0 ? 'over' : 'normal';
  if (value > max) return 'over';
  const lastMarker = markers.length ? Math.max(...markers) : Infinity;
  if (value / max >= warnAt || value >= lastMarker) return 'warning';
  return 'normal';
}

const FILL_CLASS: Record<ProgressState, string> = {
  normal: 'bg-brand',
  warning: 'bg-warning',
  over: 'bg-negative',
};

const toPercent = (part: number, whole: number) =>
  whole > 0 ? Math.min(100, Math.max(0, (part / whole) * 100)) : part > 0 ? 100 : 0;

export interface ProgressBarProps {
  /** Current value, in the same unit as `max` (e.g. cents spent). */
  value: number;
  /** Limit (e.g. budget cap in cents). */
  max: number;
  /** Intermediate warning points in the same unit (e.g. 50% and 70% of a budget). */
  markers?: readonly number[];
  /** Fraction of `max` from which the bar turns yellow. */
  warnAt?: number;
  /** Spoken description, e.g. "Mercado: 820 de 1.000 reais". */
  accessibilityLabel?: string;
  className?: string;
}

/** Progress toward a limit with optional markers; yellow near the limit, red when over. */
export function ProgressBar({
  value,
  max,
  markers = [],
  warnAt,
  accessibilityLabel,
  className,
}: ProgressBarProps) {
  const state = getProgressState(value, max, { warnAt, markers });
  const percent = toPercent(value, max);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(max > 0 ? (value / max) * 100 : 0) }}
      testID="progress-bar"
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-muted', className)}
    >
      <View
        testID="progress-fill"
        className={cn('h-full rounded-full', FILL_CLASS[state])}
        style={{ width: `${percent}%` }}
      />
      {markers.map((marker, index) => (
        <View
          key={`${marker}-${index}`}
          testID={`progress-marker-${index}`}
          className={cn(
            'absolute bottom-0 top-0 w-0.5',
            value >= marker ? 'bg-background' : 'bg-foreground-subtle',
          )}
          style={{ left: `${toPercent(marker, max)}%` }}
        />
      ))}
    </View>
  );
}
