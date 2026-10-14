import { formatDate } from '@guara/utils';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { StateSlot } from '@/components/feedback';
import { Button, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import type { DuplicateChoice } from '../duplicate-data';
import { usePositionDuplicates } from '../hooks/usePositionDuplicates';

/**
 * "Possível duplicidade": the same asset came from Open Finance and from a manual entry. Each
 * button opens "Investimento duplicado" with that choice selected (nothing changes until the
 * user confirms there).
 */
export function DuplicateNotice() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { pending, find } = usePositionDuplicates();
  const found = find(pending[0]?.id);
  if (!found) return null;
  const { duplicate, position } = found;

  const open = (choice: DuplicateChoice) =>
    router.navigate({
      pathname: '/resolve-duplicate/[duplicateId]',
      params: { duplicateId: duplicate.id, choice },
    });

  const merge = (
    <Button
      variant="inverse"
      size="md"
      leftIcon="merge"
      fullWidth={!isTablet}
      className={isTablet ? 'h-10 px-4.5' : undefined}
      onPress={() => open('sum')}
    >
      Somar em uma posição
    </Button>
  );
  const keep = (
    <Button
      variant="secondary"
      size="md"
      fullWidth={!isTablet}
      className={isTablet ? 'h-10 px-4.5' : 'flex-1'}
      onPress={() => open('keep_separate')}
    >
      Manter separados
    </Button>
  );
  const remove = (
    <Button
      variant="secondary"
      size="md"
      fullWidth={!isTablet}
      className={isTablet ? 'h-10 px-4.5' : 'flex-1'}
      onPress={() => open('delete_manual')}
    >
      Excluir um
    </Button>
  );

  return (
    <View
      accessibilityLabel="Possível duplicidade"
      className="gap-2.5 rounded-20 border border-brand bg-brand-muted px-4 py-4"
    >
      <StateSlot skeleton={false}>
        <Text size={15} weight="bold">
          {isTablet ? 'Este investimento pode estar duplicado' : 'Possível duplicidade'}
        </Text>
        <Text size={14} tone="muted">
          {isTablet
            ? `“${position.name}” chegou pelo ${duplicate.bank} e também foi cadastrado por você em ${formatDate(duplicate.manual.registeredOn, 'MMMM')}. Como prefere tratar?`
            : `“${position.name}” veio do ${duplicate.bank} e também está no seu cadastro manual.`}
        </Text>
        {isTablet ? (
          <View className="flex-row flex-wrap gap-2">
            {merge}
            {keep}
            {remove}
          </View>
        ) : (
          <View className="gap-2">
            {merge}
            <View className="flex-row gap-2">
              {keep}
              {remove}
            </View>
          </View>
        )}
      </StateSlot>
    </View>
  );
}
