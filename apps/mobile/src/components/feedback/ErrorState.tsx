import { FEEDBACK_COPY } from '@/constants/copy';

import { EmptyState } from './EmptyState';

export interface ErrorStateProps {
  onRetry: () => void;
  title?: string;
  description?: string;
  className?: string;
}

/** Neutral error message with a retry button. Never exposes technical details. */
export function ErrorState({
  onRetry,
  title = FEEDBACK_COPY.errorTitle,
  description = FEEDBACK_COPY.errorDescription,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon="wifiOff"
      tone="negative"
      title={title}
      description={description}
      action={{ label: FEEDBACK_COPY.retry, onPress: onRetry, variant: 'primary', icon: 'retry' }}
      className={className}
    />
  );
}
