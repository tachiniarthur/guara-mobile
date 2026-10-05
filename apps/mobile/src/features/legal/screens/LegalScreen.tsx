import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button, InfoNote, LinkButton, Text } from '@/components/ui';
import { OnboardingFrame } from '@/features/onboarding';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

import { PRIVACY, TERMS, type LegalDocument } from '../data';

function LegalDocumentScreen({ document }: { document: LegalDocument }) {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const done = (
    <Button
      variant="secondary"
      fullWidth={!isTablet}
      className={isTablet ? undefined : 'flex-1'}
      onPress={close}
    >
      Entendi
    </Button>
  );

  return (
    <OnboardingFrame
      topBar={{ title: document.title, leading: 'back', onLeadingPress: close }}
      footer={done}
      tabletFooter={
        <>
          <View className="flex-1" />
          {done}
        </>
      }
    >
      <View className="gap-2">
        <Text
          serif
          weight="extrabold"
          size={isTablet ? 30 : 26}
          leading={1.2}
          accessibilityRole={isTablet ? 'header' : undefined}
        >
          {document.title}
        </Text>
        <Text size={13} tone="subtle">
          {document.version}
        </Text>
      </View>
      <InfoNote icon="shieldCheck" tone="positive" size={13}>
        {document.summary}
      </InfoNote>
      <View>
        {document.sections.map((section) => (
          <View key={section.title} className={cn('gap-1.5 border-t border-border py-3.5')}>
            <Text serif weight="bold" size={18} accessibilityRole="header">
              {section.title}
            </Text>
            <Text size={15} leading={1.55} tone="muted">
              {section.body}
            </Text>
          </View>
        ))}
      </View>
      <LinkButton
        label={document.other.label}
        onPress={() => router.replace(document.other.href)}
        className="self-start"
      />
    </OnboardingFrame>
  );
}

/** Termos de uso (open with or without an account). */
export function TermsScreen() {
  return <LegalDocumentScreen document={TERMS} />;
}

/** Política de privacidade (open with or without an account). */
export function PrivacyScreen() {
  return <LegalDocumentScreen document={PRIVACY} />;
}
