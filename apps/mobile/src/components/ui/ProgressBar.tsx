import { View } from 'react-native';

import { cn } from '@/lib/cn';

export type ProgressTone = 'positive' | 'warning' | 'negative' | 'info' | 'brand' | 'neutral';

const FILL_CLASS: Record<ProgressTone, string> = {
  positive: 'bg-positive',
  warning: 'bg-warning',
  negative: 'bg-negative',
  info: 'bg-info',
  brand: 'bg-brand',
  neutral: 'bg-foreground',
};

/**
 * Month state of a budget (Fundamentos): calm up to 69%, attention from 70%, tight from 85%.
 * Always shown with words and a percentage, never by color alone.
 */
export function budgetTone(percent: number): ProgressTone {
  if (percent >= 85) return 'negative';
  if (percent >= 70) return 'warning';
  return 'positive';
}

export interface ProgressBarProps {
  /** 0–100 (values outside are clamped). */
  percent: number;
  tone?: ProgressTone;
  /** Height in dp (design: 8 or 10). */
  height?: number;
  /** Vertical marker (target) in percent, drawn in Areia. */
  marker?: number;
  /** Spoken description, e.g. "Alimentação: 742 de 1.000 reais". */
  accessibilityLabel?: string;
  className?: string;
}

/** Track in Sombra with a rounded fill. */
export function ProgressBar({
  percent,
  tone = 'positive',
  height = 10,
  marker,
  accessibilityLabel,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      testID="progress-bar"
      style={{ height, borderRadius: height / 2 }}
      className={cn('w-full bg-surface-muted', className)}
    >
      <View
        testID="progress-fill"
        className={FILL_CLASS[tone]}
        style={{ width: `${clamped}%`, height, borderRadius: height / 2 }}
      />
      {marker !== undefined ? (
        <View
          testID="progress-marker"
          className="absolute w-0.5 bg-foreground"
          style={{ left: `${marker}%`, top: -3, bottom: -3 }}
        />
      ) : null}
    </View>
  );
}
