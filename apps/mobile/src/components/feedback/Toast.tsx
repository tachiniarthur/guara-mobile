import { duration, iconSize } from '@guara/ui-tokens';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, XIcon } from 'lucide-react-native';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { Text } from '@/components/ui/Text';
import { FEEDBACK_COPY } from '@/constants/copy';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';
import { toneColor } from '@/theme/tones';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  show: (type: ToastType, message: string, durationMs?: number) => number;
  dismiss: (id: number) => void;
}

const MAX_VISIBLE = 3;
let nextId = 1;

const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  show: (type, message, durationMs = duration.toast) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }].slice(-MAX_VISIBLE) }));
    setTimeout(() => get().dismiss(id), durationMs);
    AccessibilityInfo.announceForAccessibility(message);
    if (type === 'success') haptics.success();
    if (type === 'error') haptics.error();
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Imperative API — usable anywhere, including outside React (e.g. mutation callbacks). */
export const toast = {
  success: (message: string, durationMs?: number) =>
    useToastStore.getState().show('success', message, durationMs),
  error: (message: string, durationMs?: number) =>
    useToastStore.getState().show('error', message, durationMs),
  info: (message: string, durationMs?: number) =>
    useToastStore.getState().show('info', message, durationMs),
  dismiss: (id: number) => useToastStore.getState().dismiss(id),
};

const STYLE: Record<
  ToastType,
  { icon: typeof InfoIcon; tone: 'positive' | 'negative' | 'info'; border: string }
> = {
  success: { icon: CircleCheckIcon, tone: 'positive', border: 'border-positive' },
  error: { icon: CircleAlertIcon, tone: 'negative', border: 'border-negative' },
  info: { icon: InfoIcon, tone: 'info', border: 'border-info' },
};

/** Renders active toasts at the top of the screen. Mounted once in AppProviders. */
export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 top-0 items-center gap-2 px-4"
      style={{ paddingTop: insets.top }}
    >
      {toasts.map((item) => {
        const { icon: Icon, tone, border } = STYLE[item.type];
        return (
          <Animated.View
            key={item.id}
            entering={FadeInUp.duration(duration.normal)}
            exiting={FadeOutUp.duration(duration.fast)}
            accessibilityLiveRegion="polite"
            className={cn(
              'w-full max-w-md flex-row items-center gap-3 rounded-lg border-l-4 bg-background-elevated py-3 pl-3 pr-1',
              border,
            )}
          >
            <Icon size={iconSize.md} color={toneColor[tone]} />
            <Text variant="body" className="flex-1" accessibilityRole="alert">
              {item.message}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={FEEDBACK_COPY.close}
              onPress={() => dismiss(item.id)}
              className="h-touch w-touch items-center justify-center"
            >
              <XIcon size={iconSize.sm} color={toneColor.subtle} />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
