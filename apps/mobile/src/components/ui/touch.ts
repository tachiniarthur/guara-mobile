import { controlHeight, minTouchTarget, type ControlSize } from '@guara/ui-tokens';
import type { Insets } from 'react-native';

/** Extra touch area so controls smaller than 44dp still get a 44×44 target. */
export function hitSlopFor(size: ControlSize | number): Insets | undefined {
  const height = typeof size === 'number' ? size : controlHeight[size];
  const extra = Math.max(0, (minTouchTarget - height) / 2);
  return extra > 0 ? { top: extra, bottom: extra, left: extra, right: extra } : undefined;
}
