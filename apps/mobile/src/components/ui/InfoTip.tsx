import { colors } from '@guara/ui-tokens';
import { Pressable } from 'react-native';

import { toast } from '@/components/feedback/Toast';

import { Icon } from './Icon';
import { hitSlopFor } from './touch';

export interface InfoTipProps {
  /** Explanation (the design's `title` tooltip). */
  text: string;
  /** Icon size (design: 14 in lists, 15 next to values). */
  size?: 14 | 15 | 16;
  className?: string;
}

/** (i) after a label or value: tapping shows the explanation. */
export function InfoTip({ text, size = 15, className }: InfoTipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityHint="Mostra a explicação"
      hitSlop={hitSlopFor(size)}
      onPress={() => toast.info(text)}
      className={className ?? 'ml-1.5'}
    >
      <Icon name="info" size={size} color={colors.foreground.subtle} />
    </Pressable>
  );
}
