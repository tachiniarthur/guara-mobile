import type { ExportFormat } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { toast } from '@/components/feedback';
import { Button, DataRow, Icon, IconButton, RadioGroup, Sheet, Span, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';
import { shareFile, type SavedFile } from '@/lib/share';
import { useUserStore } from '@/stores';

import { useReportExport } from '../hooks/useReportExport';
import { EXPORT_FORMATS, exportFormat } from '../lib/export';

/** "Enviar também por e-mail": label on the left, on/off track on the right. */
function EmailSwitch({
  value,
  onChange,
  email,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  email: string;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Enviar também por e-mail"
      accessibilityHint={`Para ${email}`}
      accessibilityState={{ checked: value }}
      onPress={() => {
        haptics.selection();
        onChange(!value);
      }}
      className="min-h-[52px] flex-row items-center gap-3"
    >
      <View className="min-w-0 flex-1">
        <Text weight="semibold" leading={1.35}>
          Enviar também por e-mail
        </Text>
        <Text size={13} tone="subtle" leading={1.35}>
          {`Para ${email}`}
        </Text>
      </View>
      <View
        className="h-7 w-12 justify-center rounded-full px-[3px]"
        style={{
          backgroundColor: value ? colors.brand.DEFAULT : colors.surface.muted,
          alignItems: value ? 'flex-end' : 'flex-start',
        }}
      >
        <View
          className="h-[22px] w-[22px] rounded-full"
          style={{ backgroundColor: value ? colors.background.DEFAULT : colors.foreground.muted }}
        />
      </View>
    </Pressable>
  );
}

type Stage = { kind: 'options' } | { kind: 'ready'; file: SavedFile; emailed: boolean };

/**
 * "Exportar ⌄": choose PDF, Excel or CSV (and an e-mail copy), then "Relatório pronto" with the
 * file to save or send.
 */
export function ExportMenu({
  fullWidth = false,
  variant = 'pill',
  accessibilityLabel = 'Exportar relatório em PDF, Excel ou CSV',
}: {
  fullWidth?: boolean;
  /** `icon`: header button of the phone; `button`: "Exportar" of the list pages. */
  variant?: 'pill' | 'icon' | 'button';
  /** Label of the `icon` variant. */
  accessibilityLabel?: string;
}) {
  const email = useUserStore((state) => state.email);
  const { data, generate } = useReportExport();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>({ kind: 'options' });
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [emailCopy, setEmailCopy] = useState(true);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setOpen(false);
    setStage({ kind: 'options' });
  };

  const create = async () => {
    setBusy(true);
    try {
      const file = await generate(format);
      // TODO: `reports.createExport` with `emailCopy` sends the copy once the API exists.
      setStage({ kind: 'ready', file, emailed: emailCopy });
    } catch {
      toast.error('Não deu para gerar o arquivo agora. Tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  const download = async (file: SavedFile) => {
    const shared = await shareFile(file, 'Relatório do Guará');
    if (!shared) toast.error('Não deu para abrir o arquivo agora. Tente de novo.');
  };

  const scope = `${data.periodLabel} · ${data.banksLabel}`;

  return (
    <>
      {variant === 'icon' ? (
        <IconButton
          icon="download"
          accessibilityLabel={accessibilityLabel}
          onPress={() => setOpen(true)}
        />
      ) : variant === 'button' ? (
        <Button
          variant="secondary"
          size="md"
          leftIcon="download"
          className="h-10 px-4.5"
          onPress={() => setOpen(true)}
        >
          Exportar
        </Button>
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
      <Sheet
        open={open}
        onClose={close}
        width={520}
        title={
          open ? (stage.kind === 'ready' ? 'Relatório pronto' : 'Exportar relatório') : undefined
        }
      >
        {stage.kind === 'options' ? (
          <>
            <View>
              <DataRow label="Período" value={data.periodLabel} />
              <DataRow
                label="Bancos"
                value={`${data.banksLabel} · ${data.transactions.length} ${data.transactions.length === 1 ? 'lançamento' : 'lançamentos'}`}
              />
            </View>
            <RadioGroup
              accessibilityLabel="Formato do arquivo"
              value={format}
              onChange={setFormat}
              className="gap-2"
              options={EXPORT_FORMATS.map(({ value, label, description }) => ({
                value,
                label,
                description,
              }))}
            />
            <EmailSwitch value={emailCopy} onChange={setEmailCopy} email={email} />
            <View className="flex-row flex-wrap justify-end gap-2.5">
              <Button variant="ghost" size="md" className="px-4.5" onPress={close}>
                Cancelar
              </Button>
              <Button
                size="md"
                leftIcon="download"
                className="px-4.5"
                loading={busy}
                onPress={create}
              >
                Gerar arquivo
              </Button>
            </View>
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-positive-muted">
                <Icon name="check" size={24} color={colors.positive.DEFAULT} />
              </View>
              <Text size={15} tone="muted" leading={1.55} className="min-w-0 flex-1">
                {stage.emailed ? (
                  <>
                    Enviamos uma cópia para{' '}
                    <Span weight="bold" tone="default">
                      {email}
                    </Span>
                    .
                  </>
                ) : (
                  'O arquivo está pronto para salvar ou enviar.'
                )}
              </Text>
            </View>
            <View className="flex-row items-center gap-3 rounded-16 border border-border-strong bg-surface-muted px-3.5 py-3">
              <View className="h-10 w-10 items-center justify-center rounded-12 bg-positive-muted">
                <Icon name="document" size={20} color={colors.positive.DEFAULT} />
              </View>
              <View className="min-w-0 flex-1">
                <Text size={14} weight="bold" leading={1.3} numberOfLines={1}>
                  {stage.file.name}
                </Text>
                <Text size={12} tone="subtle" leading={1.3}>
                  {`${exportFormat(format).short} · ${scope}`}
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap justify-end gap-2.5">
              <Button variant="ghost" size="md" className="px-4.5" onPress={close}>
                Fechar
              </Button>
              <Button
                size="md"
                leftIcon="download"
                className="px-4.5"
                onPress={() => download(stage.file)}
              >
                Baixar
              </Button>
            </View>
          </>
        )}
      </Sheet>
    </>
  );
}
