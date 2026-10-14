import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

/** Set by `ScreenOverlayHost`: places a node over the top of the content (below the fixed header). */
export const ScreenOverlayContext = createContext<((node: ReactNode) => void) | null>(null);
const OverlayActiveContext = createContext(false);

/**
 * Floats `children` over the top of the screen's content, like the design's notifications
 * ("Não deu para atualizar agora"). Outside a `Screen` it renders in place.
 */
export function ScreenOverlay({ children }: { children: ReactNode }) {
  const setOverlay = use(ScreenOverlayContext);
  useEffect(() => {
    if (!setOverlay) return;
    setOverlay(children);
    return () => setOverlay(null);
  }, [setOverlay, children]);
  return setOverlay ? null : <>{children}</>;
}

/**
 * Area that can float a notification over its top (`Screen` uses it below the header; screens
 * with their own scaffold wrap their content with it).
 */
export function ScreenOverlayHost({ children }: { children: ReactNode }) {
  const { isTablet } = useBreakpoint();
  const [overlay, setOverlay] = useState<ReactNode>(null);
  return (
    <ScreenOverlayContext value={setOverlay}>
      <OverlayActiveContext value={overlay != null}>
        <View className="flex-1">
          {children}
          {overlay == null ? null : (
            <View
              pointerEvents="box-none"
              className={cn(
                'absolute left-0 right-0 z-40 items-center',
                isTablet ? 'top-6' : 'top-1 px-3',
              )}
            >
              <View style={{ width: isTablet ? 560 : '100%', maxWidth: '100%' }}>{overlay}</View>
            </View>
          )}
        </View>
      </OverlayActiveContext>
    </ScreenOverlayContext>
  );
}

/** True when a notification floats over the screen (the generic offline banner steps aside). */
export function useHasOverlay(): boolean {
  return use(OverlayActiveContext);
}
