import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors, duration, navigationSize } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SlideInDown,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBreakpoint } from '@/hooks/useBreakpoint';

import { ChatPanelBody, ChatPanelHeader } from '../components';
import { SUGGESTIONS } from '../data';
import { useChatNavigation } from '../hooks/useChatNavigation';

/** How far the sheet must be dragged down to close. */
const CLOSE_DISTANCE = 120;

/**
 * "Chat aberto sobre a tela": the conversation over the current page. Phones: a sheet from the
 * bottom with a handle (drag down to close). Tablets: a panel on the right. Both offer
 * "Abrir em tela cheia".
 */
export function ChatPanelScreen() {
  const router = useRouter();
  const chat = useChatNavigation();
  const insets = useSafeAreaInsets();
  const { isTablet } = useBreakpoint();
  const dragY = useSharedValue(0);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const drag = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY(8)
    .onUpdate((event) => dragY.set(Math.max(0, event.translationY)))
    .onEnd((event) => {
      if (event.translationY > CLOSE_DISTANCE || event.velocityY > 900) close();
      else dragY.set(withSpring(0));
    });
  const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dragY.get() }] }));

  const header = (
    <ChatPanelHeader
      onHistory={chat.openHistory}
      onFullScreen={chat.openFullScreen}
      onClose={close}
    />
  );
  // Sheets opened from the composer (attach, "@") render inside the chat, above the page.
  const body = (
    <BottomSheetModalProvider>
      <ChatPanelBody suggestions={SUGGESTIONS} bottomInset={insets.bottom} />
    </BottomSheetModalProvider>
  );

  if (isTablet) {
    return (
      <View className="flex-1 flex-row" style={{ backgroundColor: colors.chatOverlay.tablet }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar o chat"
          onPress={close}
          className="flex-1"
        />
        <Animated.View
          entering={SlideInRight.duration(duration.normal)}
          accessibilityViewIsModal
          accessibilityLabel="Chat"
          className="border-l border-border-strong bg-background"
          style={{
            width: navigationSize.chatOverlayWidth,
            paddingTop: insets.top,
            shadowColor: colors.shadow,
            shadowOpacity: 0.45,
            shadowRadius: 32,
            shadowOffset: { width: -24, height: 0 },
            elevation: 24,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {header}
            {body}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.chatOverlay.phone }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar o chat"
        onPress={close}
        style={{ height: insets.top + navigationSize.chatSheetTop }}
      />
      <Animated.View
        entering={SlideInDown.duration(duration.normal)}
        accessibilityViewIsModal
        accessibilityLabel="Chat"
        className="flex-1 overflow-hidden border-t border-border-strong bg-background"
        style={[{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }, dragStyle]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <GestureDetector gesture={drag}>
            <View>
              <View
                importantForAccessibility="no-hide-descendants"
                className="mb-0.5 mt-2.5 h-1 w-10 self-center rounded-[2px] bg-border-strong"
              />
              {header}
            </View>
          </GestureDetector>
          {body}
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}
