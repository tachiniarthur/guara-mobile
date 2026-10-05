import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import type { SegmentOption } from './SegmentedControl';
import { Text } from './Text';

export interface UnderlineTabsProps<V extends string> {
  options: readonly SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  accessibilityLabel?: string;
  /** Horizontal padding of each tab: 10 (default) or 12 (tablet). */
  wide?: boolean;
  className?: string;
}

/** Text tabs with an Areia underline on the selected one (chart periods: 1M · 6M · 1A). */
export function UnderlineTabs<V extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  wide = false,
  className,
}: UnderlineTabsProps<V>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected }}
            hitSlop={{ top: 4, bottom: 4 }}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            className={cn(
              'h-9 items-center justify-center border-b-2',
              wide ? 'px-3' : 'px-2.5',
              selected ? 'border-foreground' : 'border-transparent',
            )}
          >
            <Text
              size={14}
              weight={selected ? 'bold' : 'medium'}
              tone={selected ? 'default' : 'muted'}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
