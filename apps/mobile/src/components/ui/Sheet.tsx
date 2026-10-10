import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { colors, spacing } from '@guara/ui-tokens';
import { useEffect, useRef, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBreakpoint } from '@/hooks/useBreakpoint';

import { Text } from './Text';

export interface SheetProps {
  open: boolean;
  /** Called when the user dismisses the sheet (swipe, backdrop, back button). */
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Fixed snap points (e.g. ['50%', '90%']). Default: sized to the content. */
  snapPoints?: (string | number)[];
  /** Tablet dialog width (design: 460, 480 or 520). */
  width?: 460 | 480 | 520;
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

/**
 * Panel controlled by `open`. Phone: bottom sheet with a handle (requires
 * BottomSheetModalProvider). Tablet: centered dialog, like the Fundamentos.
 */
export function Sheet({ open, onClose, title, children, snapPoints, width = 480 }: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  /** Whether the modal is currently presented (avoids dismissing a closed modal). */
  const presented = useRef(false);
  const insets = useSafeAreaInsets();
  const { isTablet } = useBreakpoint();

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

  if (isTablet) {
    return (
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View className="flex-1 items-center justify-center bg-overlay px-6">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            onPress={onClose}
            className="absolute bottom-0 left-0 right-0 top-0"
          />
          <View
            accessibilityViewIsModal
            className="max-h-[85%] w-full rounded-28 border border-border-strong bg-surface"
            style={{
              maxWidth: width,
              shadowColor: colors.shadow,
              shadowOpacity: 0.5,
              shadowRadius: 32,
              shadowOffset: { width: 0, height: 24 },
              elevation: 24,
            }}
          >
            <ScrollView contentContainerStyle={{ padding: 28, gap: spacing[4] }}>
              {title ? (
                <Text serif weight="bold" size={22} leading={1.25} accessibilityRole="header">
                  {title}
                </Text>
              ) : null}
              {children}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

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
