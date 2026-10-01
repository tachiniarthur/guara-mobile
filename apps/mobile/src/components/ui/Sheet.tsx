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
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) ref.current?.present();
    else ref.current?.dismiss();
  }, [open]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      onDismiss={onClose}
      backdropComponent={Backdrop}
      backgroundStyle={{ backgroundColor: colors.background.elevated }}
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
          <Text variant="subtitle" accessibilityRole="header">
            {title}
          </Text>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
