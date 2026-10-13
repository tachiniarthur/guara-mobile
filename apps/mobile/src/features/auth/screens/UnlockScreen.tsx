import { colors } from '@guara/ui-tokens';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/brand';
import { toast } from '@/components/feedback';
import { MataBackdrop } from '@/components/illustrations';
import { Button, Icon, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { authenticate, biometricKind, type BiometricKind } from '@/lib/biometrics';
import { haptics } from '@/lib/haptics';
import { useAuth } from '@/providers';
import { useUserStore } from '@/stores';

import { useAppLockStore } from '../lock';

const KIND_LABEL: Record<Exclude<BiometricKind, 'none'>, { button: string; tap: string }> = {
  face: { button: 'Desbloquear com Face ID', tap: 'Toque para usar o Face ID' },
  fingerprint: { button: 'Desbloquear com a digital', tap: 'Toque para usar a digital' },
};

/** "Olá, Arthur · O Guará está bloqueado": face, fingerprint or the device passcode. */
export function UnlockScreen() {
  const { isTablet } = useBreakpoint();
  const name = useUserStore((state) => state.name);
  const { setStatus } = useAuth();
  const unlock = useAppLockStore((state) => state.unlock);
  const [kind, setKind] = useState<BiometricKind | null>(null);

  useEffect(() => {
    let active = true;
    void biometricKind().then((value) => {
      if (active) setKind(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const tryUnlock = async (passcode: boolean) => {
    haptics.selection();
    const result = await authenticate({ passcode });
    if (result === 'success') {
      haptics.success();
      unlock();
    } else if (result === 'failed') {
      toast.error('Não deu para desbloquear. Tente de novo ou use a senha do aparelho.');
    }
  };

  const signOut = () => {
    unlock();
    setStatus('signedOut');
  };

  const label = kind && kind !== 'none' ? KIND_LABEL[kind] : null;
  return (
    <View className="flex-1 bg-background">
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '46%' }}
      >
        <MataBackdrop />
      </View>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          className="flex-1 justify-center gap-7 px-6 pb-10 pt-24"
          style={isTablet ? { maxWidth: 440, width: '100%', alignSelf: 'center' } : undefined}
        >
          <View className="items-center gap-[18px]">
            <LogoMark size={88} />
            <Text serif weight="extrabold" size={30} align="center" accessibilityRole="header">
              {`Olá, ${name}`}
            </Text>
            <Text size={15} tone="muted" align="center" leading={1.55}>
              O Guará está bloqueado para proteger seus dados.
            </Text>
            {label ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={label.button}
                  onPress={() => void tryUnlock(false)}
                  className="h-28 w-28 items-center justify-center rounded-[32px] border border-border-strong bg-surface active:bg-surface-pressed"
                >
                  <Icon
                    name={kind === 'face' ? 'faceId' : 'fingerprint'}
                    size={52}
                    color={colors.brand.DEFAULT}
                  />
                </Pressable>
                <Text size={16} weight="bold">
                  {label.tap}
                </Text>
              </>
            ) : null}
          </View>
          <View className="gap-2">
            <Button variant="secondary" fullWidth onPress={() => void tryUnlock(true)}>
              Usar a senha do aparelho
            </Button>
            <Button variant="ghost" fullWidth onPress={signOut}>
              Sair da conta
            </Button>
          </View>
          <Text size={13} tone="subtle" align="center" leading={1.55}>
            O bloqueio volta sempre que o app fica mais de 1 minuto em segundo plano. Você muda isso
            em Meu perfil › Segurança.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
