import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { IconName } from '@/components/ui/Icon';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { ChatFab } from '@/navigation/ChatFab';

import { type Crumb } from './Breadcrumb';
import { PageHeader } from './PageHeader';
import { Screen } from './Screen';
import { StickyFooter } from './StickyFooter';
import { TopBar } from './TopBar';

export interface FormScreenProps {
  /** Phone top bar title ("Novo teto de gasto"). */
  title: string;
  /** Tablet page title (default: `title`). */
  tabletTitle?: string;
  /** Tablet breadcrumb parents ("Alertas"). */
  parents: Crumb[];
  /** Tablet breadcrumb current item ("Novo teto"). */
  current: string;
  /** Where to go when closing without history. */
  fallbackHref: Href;
  submit: { label: string; icon?: IconName; onPress: () => void; disabled?: boolean };
  /** Phone content classes (default: 22 gap). */
  contentClassName?: string;
  /** "Chat em qualquer tela": the chat button (off in the bank connection flow). */
  chat?: boolean;
  children: ReactNode;
}

/**
 * Create/edit page. Phone: close button, form and a sticky main action.
 * Tablet: breadcrumb, Fraunces title, form and the actions aligned to the right.
 */
export function FormScreen({
  title,
  tabletTitle,
  parents,
  current,
  fallbackHref,
  submit,
  contentClassName = 'gap-5.5 pt-2',
  chat = true,
  children,
}: FormScreenProps) {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const close = () => (router.canGoBack() ? router.back() : router.replace(fallbackHref));

  const submitButton = (
    <Button
      leftIcon={submit.icon ?? 'check'}
      size={isTablet ? 'md' : 'lg'}
      fullWidth={!isTablet}
      disabled={submit.disabled}
      onPress={submit.onPress}
      className={isTablet ? 'px-4.5' : 'flex-1'}
    >
      {submit.label}
    </Button>
  );

  if (isTablet) {
    return (
      <View className="flex-1">
        <Screen contentClassName={chat ? 'pb-28' : undefined}>
          <PageHeader title={tabletTitle ?? title} breadcrumb={{ parents, current }} />
          {children}
          <View className="flex-row justify-end gap-2.5">
            <Button variant="secondary" size="md" className="px-4.5" onPress={close}>
              Cancelar
            </Button>
            {submitButton}
          </View>
        </Screen>
        {chat ? <ChatFab /> : null}
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Screen
        header={<TopBar title={title} leading="close" onLeadingPress={close} />}
        footer={<StickyFooter>{submitButton}</StickyFooter>}
        contentClassName={cn(contentClassName, chat && 'pb-20')}
      >
        {children}
      </Screen>
      {chat ? <ChatFab /> : null}
    </View>
  );
}
