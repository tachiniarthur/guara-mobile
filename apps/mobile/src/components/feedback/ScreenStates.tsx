import { colors } from '@guara/ui-tokens';
import { formatDate, todayISODate } from '@guara/utils';
import { createContext, use, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { ScreenOverlay } from '@/components/layout/ScreenOverlay';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/InfoNote';
import { SkeletonScope } from '@/components/ui/SkeletonScope';
import { Span, Text } from '@/components/ui/Text';
import { useOnline } from '@/hooks/useOnline';
import { cn } from '@/lib/cn';
import { useScreenPreview } from '@/stores/screen-preview';

/** `loading` and `error` come from the API; `empty` when there is nothing to show yet. */
export type ScreenStatus = 'loading' | 'error' | 'empty' | 'ready';

/** The screen's status, or the one previewed from the UI catalog (development only). */
export function useScreenStatus(status: ScreenStatus): ScreenStatus {
  const preview = useScreenPreview((state) => state.preview);
  return __DEV__ && preview !== 'auto' ? preview : status;
}

/** "hoje, 14:30", or "23/09, 14:30" on another day (São Paulo time). */
export function lastUpdateLabel(at: string): string {
  const day = formatDate(at, 'yyyy-MM-dd');
  return day === todayISODate()
    ? `hoje, ${formatDate(at, 'HH:mm')}`
    : formatDate(at, 'dd/MM, HH:mm');
}

export const LOAD_ERROR_TITLE = 'Não deu para carregar';
export const LOAD_ERROR_DESCRIPTION =
  'Seus dados continuam salvos. A conexão com o Guará falhou agora.';
export const EMPTY_DESCRIPTION = 'Aparece aqui quando houver dados.';

interface ScreenStateValue {
  status: ScreenStatus;
  /** Showing the last data without internet. */
  offline: boolean;
  /** "Sem internet · dados de hoje, 14:30" (caption of every container while offline). */
  offlineCaption: string;
  retry: () => void;
}

const ScreenStateContext = createContext<ScreenStateValue>({
  status: 'ready',
  offline: false,
  offlineCaption: '',
  retry: () => undefined,
});

/** State of the screen around a container (`ready` outside `ScreenStates`). */
export function useScreenState(): ScreenStateValue {
  return use(ScreenStateContext);
}

/**
 * The standard states of a screen (Fundamentos · Estados). Each state is a variation of the
 * screen itself: the same containers in the same place, each one showing the state inside
 * (`SectionCard` and `StateSlot`).
 * - loading: the layout drawn as blocks and "Carregando…" for screen readers;
 * - error: red notification at the top and "Não deu para carregar" in each container;
 * - offline: yellow notification at the top, the last data and "Sem internet · dados de…"
 *   in place of each container's caption;
 * - empty: "—" in each container, and the message with the next step in the main one.
 */
export function ScreenStates({
  status,
  onRetry,
  since,
  children,
}: {
  status: ScreenStatus;
  onRetry: () => void;
  /** When the data shown was updated (ISO). */
  since: string;
  children: ReactNode;
}) {
  const online = useOnline();
  const { preview, setPreview } = useScreenPreview();
  // A previewed error goes back to the real screen.
  const retry = () => {
    if (preview !== 'auto') setPreview('auto');
    onRetry();
  };
  const sinceLabel = lastUpdateLabel(since);
  const offline = !online && status !== 'loading' && status !== 'error';
  const value: ScreenStateValue = {
    status,
    offline,
    offlineCaption: `Sem internet · dados de ${sinceLabel}`,
    retry,
  };
  const notice = status === 'error' ? 'error' : offline ? 'offline' : null;

  return (
    <ScreenStateContext value={value}>
      {status === 'loading' ? (
        <Text
          accessibilityRole="progressbar"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        >
          Carregando…
        </Text>
      ) : null}
      {notice ? (
        <ScreenOverlay>
          <StateNotice key={notice} kind={notice} since={sinceLabel} />
        </ScreenOverlay>
      ) : null}
      {children}
    </ScreenStateContext>
  );
}

/** Notification at the top of the screen: connection error (red) or offline (yellow). */
export function StateNotice({ kind, since }: { kind: 'error' | 'offline'; since: string }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  const error = kind === 'error';
  return (
    <View
      accessibilityRole={error ? 'alert' : 'summary'}
      accessibilityLiveRegion="polite"
      className={cn(
        'flex-row items-center gap-3 rounded-18 border bg-surface-input py-3 pl-3.5 pr-2',
        error ? 'border-negative' : 'border-brand',
      )}
      style={{
        shadowColor: colors.shadow,
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 12 },
        elevation: 12,
      }}
    >
      <View
        className={cn(
          'h-9 w-9 items-center justify-center rounded-12',
          error ? 'bg-negative-muted' : 'bg-brand-muted',
        )}
      >
        <Icon
          name={error ? 'alertTriangle' : 'wifiOff'}
          size={18}
          color={error ? colors.negative.DEFAULT : colors.brand.DEFAULT}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text size={15} weight="bold" leading={1.35}>
          {error ? 'Não deu para atualizar agora' : 'Sem internet'}
        </Text>
        <Text size={13} tone="muted" leading={1.35}>
          {error
            ? 'Seus dados continuam salvos.'
            : `Mostrando os dados de ${since}. Atualizamos quando a conexão voltar.`}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar aviso"
        hitSlop={4}
        onPress={() => setClosed(true)}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-pressed"
      >
        <Icon name="close" size={16} />
      </Pressable>
    </View>
  );
}

/** What waits for the connection ("Exportar volta quando a conexão voltar."). */
export function OfflineNote({ since, paused }: { since: string; paused?: string }) {
  return (
    <InfoNote icon="wifiOff" tone="warning" size={13} iconColor={colors.brand.DEFAULT}>
      <Text size={13} leading={1.5}>
        <Span weight="bold">Sem internet.</Span>
        {` Mostrando os dados de ${since}.${paused ? ` ${paused}` : ''}`}
      </Text>
    </InfoNote>
  );
}

/** "Não deu para carregar" inside a container; `compact` for small tiles. */
export function ContainerError({ compact = false }: { compact?: boolean }) {
  const { retry } = useScreenState();
  if (compact) {
    return (
      <View className="flex-grow items-center justify-center gap-1.5">
        <Icon name="alertTriangle" size={22} color={colors.negative.DEFAULT} />
        <Text size={14} weight="bold" align="center">
          {LOAD_ERROR_TITLE}
        </Text>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="retry"
          onPress={retry}
          className="h-9 self-center"
        >
          Tentar de novo
        </Button>
      </View>
    );
  }
  return (
    <StateMessage
      icon="alertTriangle"
      tone="negative"
      title={LOAD_ERROR_TITLE}
      description={LOAD_ERROR_DESCRIPTION}
      action={
        <Button variant="secondary" size="md" leftIcon="retry" onPress={retry} className="h-10">
          Tentar de novo
        </Button>
      }
    />
  );
}

/** Container without data: "—" and "Aparece aqui quando houver dados." */
export function ContainerEmpty({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <View className="flex-grow items-center justify-center">
        <Text serif weight="bold" size={26} tone="subtle" accessibilityLabel="Sem dados">
          —
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-grow items-center justify-center gap-2.5 p-2">
      <StateCircle icon="infoLarge" />
      <Text serif weight="extrabold" size={30} leading={1.2} accessibilityLabel="Sem dados">
        —
      </Text>
      <Text size={14} leading={1.55} tone="muted" align="center">
        {EMPTY_DESCRIPTION}
      </Text>
    </View>
  );
}

function StateCircle({
  icon,
  tone = 'neutral',
}: {
  icon: IconName;
  tone?: 'neutral' | 'negative';
}) {
  return (
    <View
      className={cn(
        'h-14 w-14 items-center justify-center rounded-full',
        tone === 'negative' ? 'bg-negative-muted' : 'bg-surface-muted',
      )}
    >
      <Icon
        name={icon}
        size={26}
        color={tone === 'negative' ? colors.negative.DEFAULT : colors.foreground.muted}
      />
    </View>
  );
}

/**
 * Message in place of a container's content: 56 circle, Fraunces 19 title, text and the next
 * step ("Nenhum alerta ainda" + "Novo teto"; "Nada com esse filtro" + "Limpar filtros").
 */
export function StateMessage({
  icon,
  tone = 'neutral',
  title,
  description,
  action,
}: {
  icon: IconName;
  tone?: 'neutral' | 'negative';
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View className="flex-grow items-center justify-center gap-2.5 p-2">
      <StateCircle icon={icon} tone={tone} />
      <Text serif weight="bold" size={19} leading={1.25} align="center" accessibilityRole="header">
        {title}
      </Text>
      {description ? (
        <Text size={14} leading={1.55} tone="muted" align="center" style={{ maxWidth: 420 }}>
          {description}
        </Text>
      ) : null}
      {action ? <View className="flex-row flex-wrap justify-center gap-2">{action}</View> : null}
    </View>
  );
}

/**
 * Body of a container that follows the screen state: blocks while loading, "Não deu para
 * carregar" on error and "—" (or `empty`) when there is no data. The replaced content stays
 * laid out but hidden, so the container keeps its size and place.
 */
export function StateSlot({
  children,
  empty,
  compact = false,
  skeleton = true,
}: {
  children: ReactNode;
  /** Message of the main container when empty; `null` keeps the content (static info). */
  empty?: ReactNode;
  compact?: boolean;
  /** Draw the content as blocks while loading (default true; notices keep their text). */
  skeleton?: boolean;
}) {
  const { status } = useScreenState();
  if (status === 'loading') {
    return (
      <SkeletonScope active off={!skeleton}>
        {children}
      </SkeletonScope>
    );
  }
  if (status === 'error') {
    return <Replaced content={children}>{<ContainerError compact={compact} />}</Replaced>;
  }
  if (status === 'empty' && empty !== null) {
    return <Replaced content={children}>{empty ?? <ContainerEmpty compact={compact} />}</Replaced>;
  }
  return <>{children}</>;
}

/** Shows `children` in the room of `content` (at least its height). */
function Replaced({ content, children }: { content: ReactNode; children: ReactNode }) {
  const [height, setHeight] = useState<number>();
  return (
    <View className="flex-grow" style={{ minHeight: height }}>
      <View
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        className="absolute left-0 right-0 top-0 opacity-0"
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      >
        {content}
      </View>
      {children}
    </View>
  );
}

/** "Nada com esse filtro": one message in place of the filtered list, with "Limpar filtros". */
export function FilterEmpty({
  description,
  onClear,
}: {
  description: string;
  onClear: () => void;
}) {
  return (
    <StateMessage
      icon="search"
      title="Nada com esse filtro"
      description={description}
      action={
        <Button variant="secondary" size="md" onPress={onClear} className="h-10">
          Limpar filtros
        </Button>
      }
    />
  );
}
