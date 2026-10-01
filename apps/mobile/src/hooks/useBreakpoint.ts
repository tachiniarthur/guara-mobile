import { breakpoints, contentMaxWidth, type Breakpoint } from '@guara/ui-tokens';
import { useWindowDimensions } from 'react-native';

export function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'phone';
}

/** Phone and tablet share every feature; use this only to adapt the layout. */
export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  return {
    width,
    breakpoint,
    isTablet: breakpoint !== 'phone',
    contentMaxWidth: contentMaxWidth[breakpoint],
  };
}
