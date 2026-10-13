import { colors } from '@guara/ui-tokens';
import { Platform, View } from 'react-native';
import { create } from 'zustand';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Span, Text } from '@/components/ui/Text';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { openNotificationSettings } from '@/lib/notifications';

/** "Agora não" hides the notice until the app opens again. */
const useDismissed = create<{ dismissed: boolean; dismiss: () => void }>()((set) => ({
  dismissed: false,
  dismiss: () => set({ dismissed: true }),
}));

/** Where to turn notifications on in each system. */
const SETTINGS_PATH =
  Platform.OS === 'ios'
    ? 'Ajustes › Guará › Notificações › Permitir notificações'
    : 'Configurações › Apps › Guará › Notificações';

/**
 * "As notificações do Guará estão desligadas neste celular": shown only while the permission is
 * denied. `onboarding` offers "Seguir só com e-mail" instead of "Agora não".
 */
export function NotificationsOffNotice({
  variant = 'settings',
  onEmailOnly,
}: {
  variant?: 'settings' | 'onboarding';
  /** Onboarding: turn the phone channel off and go on with e-mail. */
  onEmailOnly?: () => void;
}) {
  const permission = useNotificationPermission();
  const { dismissed, dismiss } = useDismissed();
  if (permission !== 'denied' || (variant === 'settings' && dismissed)) return null;

  return (
    <View
      accessibilityRole="alert"
      className="flex-row items-start gap-3.5 rounded-20 border border-warning-border bg-brand-muted p-[18px]"
    >
      <View className="h-10 w-10 items-center justify-center rounded-12 bg-brand-muted">
        <Icon name="alertTriangle" size={20} color={colors.brand.DEFAULT} />
      </View>
      <View className="min-w-0 flex-1 gap-2.5">
        <Text size={16} weight="bold" leading={1.35}>
          As notificações do Guará estão desligadas neste celular
        </Text>
        <Text size={14} leading={1.55}>
          {variant === 'onboarding'
            ? 'Sem a permissão, os avisos de tetos, preços e compras fora do padrão não chegam no celular. Por e-mail continuam chegando.'
            : 'Você não vai receber no celular os avisos de tetos, preços e compras fora do padrão. Os e-mails continuam chegando.'}
        </Text>
        <Text size={13} tone="muted" leading={1.5}>
          <Span weight="bold" tone="default">
            Para ligar:
          </Span>{' '}
          {SETTINGS_PATH}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Button size="md" className="h-11 px-4.5" onPress={() => void openNotificationSettings()}>
            Abrir ajustes
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="h-11 px-4.5"
            onPress={variant === 'onboarding' ? onEmailOnly : dismiss}
          >
            {variant === 'onboarding' ? 'Seguir só com e-mail' : 'Agora não'}
          </Button>
        </View>
      </View>
    </View>
  );
}
