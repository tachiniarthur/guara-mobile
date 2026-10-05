import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { colors, spacing } from '@guara/ui-tokens';
import { useEffect, useRef, type ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';

export interface SheetProps {
  open: boolean;
  /** Called when the user dismisses the sheet (swipe, backdrop, back button). */
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Fixed snap points (e.g. ['50%', '90%']). Default: sized to the content. */
  snapPoints?: (string | number)[];
}

function Backdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      style={[props.style, { backgroundColor: colors.overlay }]}
    />
  );
}

/** Bottom sheet with the app look, controlled by `open`. Requires BottomSheetModalProvider. */
export function Sheet({ open, onClose, title, children, snapPoints }: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  /** Whether the modal is currently presented (avoids dismissing a closed modal). */
  const presented = useRef(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open && !presented.current) {
      presented.current = true;
      ref.current?.present();
    } else if (!open && presented.current) {
      // Only dismiss what is on screen: calling dismiss() on a modal that was never
      // presented leaves @gorhom/bottom-sheet stuck in DISMISSING, and later present()
      // calls are silently ignored.
      presented.current = false;
      ref.current?.dismiss();
    }
  }, [open]);

  const handleDismiss = () => {
    // Closed by the user (swipe, backdrop, back button): already off screen.
    presented.current = false;
    onClose();
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      onDismiss={handleDismiss}
      backdropComponent={Backdrop}
      backgroundStyle={{ backgroundColor: colors.surface.input, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.border.strong }}
      accessible={false}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: spacing[4],
          paddingTop: spacing[2],
          paddingBottom: insets.bottom + spacing[4],
          gap: spacing[3],
        }}
      >
        {title ? (
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
