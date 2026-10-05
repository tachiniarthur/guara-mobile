import { useState } from 'react';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { Button, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

/** "Possível duplicidade": the same asset came from Open Finance and from a manual entry. */
export function DuplicateNotice() {
  const { isTablet } = useBreakpoint();
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const resolve = (message: string) => {
    setOpen(false);
    toast.success(message);
  };

  const merge = (
    <Button
      variant="inverse"
      size="md"
      leftIcon="merge"
      fullWidth={!isTablet}
      className={isTablet ? 'h-10 px-4.5' : undefined}
      onPress={() => resolve('Posições somadas')}
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
      onPress={() => resolve('Posições mantidas separadas')}
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
      onPress={() => resolve('Uma das posições foi excluída')}
    >
      Excluir um
    </Button>
  );

  return (
    <View
      accessibilityLabel="Possível duplicidade"
      className="gap-2.5 rounded-20 border border-brand bg-brand-muted px-4 py-4"
    >
      <Text size={15} weight="bold">
        {isTablet ? 'Este investimento pode estar duplicado' : 'Possível duplicidade'}
      </Text>
      <Text size={14} tone="muted">
        {isTablet
          ? '“Tesouro Selic 2029” chegou pelo Itaú e também foi cadastrado por você em agosto. Como prefere tratar?'
          : '“Tesouro Selic 2029” veio do Itaú e também está no seu cadastro manual.'}
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
    </View>
  );
}
