import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Text } from './Text';

export interface SegmentOption<V extends string> {
  value: V;
  label: string;
  /** Spoken label when the visible one is an abbreviation ("6M" → "6 meses"). */
  accessibilityLabel?: string;
}

export interface SegmentedControlProps<V extends string> {
  options: readonly SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  accessibilityLabel?: string;
  /** `md`: 40 tall, 14 text ("Tudo junto / Por banco"); `sm`: 36 tall, 13 text ("Mês / Ano"); `xs`: 34 tall (chart periods). */
  size?: 'xs' | 'sm' | 'md';
  /** Stretch the segments to the full width. */
  fill?: boolean;
  /**
   * `inverse` (default): selected in Areia with dark text.
   * `raised`: selected in Folha escura with light text (tablet "Consolidado / Por banco").
   */
  appearance?: 'inverse' | 'raised';
  /** Track color: Sombra (default) or the input color. */
  track?: 'muted' | 'input';
  /** Label size override (design: 13 or 14). */
  textSize?: number;
  className?: string;
}

/** Pill group on Sombra; the selected option is Areia with dark text. */
export function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  size = 'md',
  fill = false,
  appearance = 'inverse',
  track = 'muted',
  textSize,
  className,
}: SegmentedControlProps<V>) {
  const raised = appearance === 'raised';
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'flex-row gap-1 p-1',
        track === 'input' ? 'bg-surface-input' : 'bg-surface-muted',
        raised ? 'rounded-16' : 'rounded-full',
        fill ? 'self-stretch' : 'self-start',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            className={cn(
              'items-center justify-center rounded-full',
              size === 'md' ? 'h-10 px-3' : size === 'sm' ? 'h-9 px-4' : 'h-[34px] px-[9px]',
              fill && 'flex-1',
              selected ? (raised ? 'bg-surface' : 'bg-foreground') : 'active:bg-surface-pressed',
            )}
          >
            <Text
              size={textSize ?? (size === 'md' ? 14 : 13)}
              weight={selected ? 'bold' : 'medium'}
              tone={selected ? (raised ? 'default' : 'inverse') : 'muted'}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
