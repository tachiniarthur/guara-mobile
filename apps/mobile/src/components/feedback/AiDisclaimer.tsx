import { Text } from '@/components/ui/Text';
import { AI_DISCLAIMER } from '@/constants/copy';
import { cn } from '@/lib/cn';

/** Fixed notice under the chat composer. */
export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <Text size={12} tone="subtle" align="center" className={cn(className)}>
      {AI_DISCLAIMER}
    </Text>
  );
}
