import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { Button, Icon, InfoNote, Span, Text } from '@/components/ui';

import { APPLE_AVAILABLE } from '../hooks/useSocialSignIn';

/** "Voltar" at the top of a step. */
export function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-1.5 self-start"
    >
      <Icon name="chevronLeft" size={18} color={colors.foreground.muted} />
      <Text size={15} weight="semibold" tone="muted">
        Voltar
      </Text>
    </Pressable>
  );
}

const LINE = { flex: 1, height: 1, backgroundColor: colors.border.DEFAULT } as const;

/** "ou com e-mail". */
export function OrDivider() {
  return (
    <View className="w-full flex-row items-center gap-3">
      {/* Plain lines: Divider's full width collapses beside the text. */}
      <View style={LINE} />
      <Text variant="caption" tone="subtle">
        ou com e-mail
      </Text>
      <View style={LINE} />
    </View>
  );
}

/** "Continuar com Google" and, on iPhone and iPad, "Continuar com Apple". */
export function SocialButtons({
  onGoogle,
  onApple,
  busy,
}: {
  onGoogle: () => void;
  onApple: () => void;
  busy: 'google' | 'apple' | null;
}) {
  return (
    <View className="gap-2.5">
      <Button variant="secondary" fullWidth loading={busy === 'google'} onPress={onGoogle}>
        Continuar com Google
      </Button>
      {APPLE_AVAILABLE ? (
        <Button variant="secondary" fullWidth loading={busy === 'apple'} onPress={onApple}>
          Continuar com Apple
        </Button>
      ) : null}
    </View>
  );
}

/** "Sem internet. Conecte-se ao Wi-Fi ou aos dados móveis…". */
export function NoInternetNote() {
  return (
    <InfoNote icon="alertTriangle" tone="warning" size={13} iconColor={colors.brand.DEFAULT}>
      <Text size={13} leading={1.5}>
        <Span weight="bold">Sem internet.</Span> Conecte-se ao Wi-Fi ou aos dados móveis para
        receber o código. Seu e-mail continua preenchido.
      </Text>
    </InfoNote>
  );
}
