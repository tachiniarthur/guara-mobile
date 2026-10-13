import { colors } from '@guara/ui-tokens';
import { formatDate, todayISODate } from '@guara/utils';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { InfoNote } from '@/components/ui/InfoNote';
import { Skeleton } from '@/components/ui/Skeleton';
import { Span, Text } from '@/components/ui/Text';
import { useOnline } from '@/hooks/useOnline';
import { useScreenPreview } from '@/stores/screen-preview';

import { ErrorState } from './ErrorState';

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

export const LOAD_ERROR_DESCRIPTION =
  'Seus dados continuam salvos. A conexão com o Guará falhou agora; tente de novo em instantes.';

/** "Sem internet. Mostrando os dados da última atualização, hoje, 14:30. …" */
export function OfflineNote({ since, paused }: { since: string; paused?: string }) {
  return (
    <InfoNote icon="wifiOff" tone="warning" size={13} iconColor={colors.brand.DEFAULT}>
      <Text size={13} leading={1.5}>
        <Span weight="bold">Sem internet.</Span>
        {` Mostrando os dados da última atualização, ${since}. Atualizamos sozinhos quando a conexão voltar.${paused ? ` ${paused}` : ''}`}
      </Text>
    </InfoNote>
  );
}

/** "Carregando…": placeholders with the shape of the cards. */
export function LoadingCards({ cards = 2 }: { cards?: number }) {
  return (
    <View className="gap-4">
      <Text accessibilityRole="progressbar" size={13} tone="subtle">
        Carregando…
      </Text>
      {Array.from({ length: cards }, (_, index) => (
        <View key={index} className="gap-3.5 rounded-24 border border-border bg-surface p-5">
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-8 w-3/5" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </View>
      ))}
    </View>
  );
}

/**
 * The standard states of a screen: loading, connection error (with retry), empty, and the
 * content with the offline note while the device has no internet.
 */
export function ScreenStates({
  status,
  errorTitle,
  onRetry,
  empty,
  offline,
  children,
}: {
  status: ScreenStatus;
  /** "Não deu para carregar o seu resumo". */
  errorTitle: string;
  onRetry: () => void;
  /** What to show when there is nothing yet (`null` keeps the content). */
  empty?: ReactNode;
  /** When the data was updated ("hoje, 14:30") and what waits for the connection. */
  offline: { since: string; paused?: string };
  children: ReactNode;
}) {
  const online = useOnline();
  const { preview, setPreview } = useScreenPreview();
  // A previewed error goes back to the real screen.
  const retry = () => {
    if (preview !== 'auto') setPreview('auto');
    onRetry();
  };
  if (status === 'loading') return <LoadingCards />;
  if (status === 'error') {
    return (
      <View className="rounded-24 border border-border bg-surface p-3">
        <ErrorState title={errorTitle} description={LOAD_ERROR_DESCRIPTION} onRetry={retry} />
      </View>
    );
  }
  if (status === 'empty' && empty) return <>{empty}</>;
  return (
    <>
      {online ? null : <OfflineNote since={offline.since} paused={offline.paused} />}
      {children}
    </>
  );
}
