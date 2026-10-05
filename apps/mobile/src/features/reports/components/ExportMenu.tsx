import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { toast } from '@/components/feedback';
import { Icon, IconButton, Sheet, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

const FORMATS = [
  { value: 'pdf', label: 'PDF', description: 'Para ler e imprimir' },
  { value: 'xlsx', label: 'Excel', description: 'Planilha com todos os lançamentos' },
  { value: 'csv', label: 'CSV', description: 'Para importar em outro app' },
] as const;

/** "Exportar ⌄": PDF, Excel or CSV. */
export function ExportMenu({
  fullWidth = false,
  variant = 'pill',
}: {
  fullWidth?: boolean;
  /** `icon`: header button of the phone. */
  variant?: 'pill' | 'icon';
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === 'icon' ? (
        <IconButton
          icon="download"
          accessibilityLabel="Exportar relatório em PDF, Excel ou CSV"
          onPress={() => setOpen(true)}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exportar relatório"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(true)}
          className={cn(
            'h-11 flex-row items-center justify-center gap-2 rounded-full border border-border-strong bg-surface px-4 active:bg-surface-pressed',
            fullWidth && 'self-stretch',
          )}
        >
          <Icon name="download" size={18} color={colors.foreground.DEFAULT} />
          <Text size={14} weight="bold">
            Exportar
          </Text>
          <Icon name="chevronDown" size={16} color={colors.foreground.muted} />
        </Pressable>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="Exportar relatório">
        <View accessibilityRole="menu">
          {FORMATS.map((format) => (
            <Pressable
              key={format.value}
              accessibilityRole="menuitem"
              onPress={() => {
                setOpen(false);
                toast.success(`Relatório em ${format.label} sendo gerado`);
              }}
              className="min-h-14 justify-center rounded-14 px-3 active:bg-surface-pressed"
            >
              <Text size={15} weight="bold">
                {format.label}
              </Text>
              <Text variant="caption" tone="subtle">
                {format.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </Sheet>
    </>
  );
}
