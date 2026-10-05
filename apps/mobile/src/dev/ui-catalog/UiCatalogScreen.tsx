import { Screen, TopBar } from '@/components/layout';
import { Text } from '@/components/ui';

import {
  ButtonsSection,
  IconsSection,
  InputsSection,
  TypographySection,
  ValuesSection,
} from './sections-basics';
import {
  ChartsSection,
  DisplaySection,
  FeedbackSection,
  LayoutSection,
  SelectionSection,
} from './sections-more';
import { LedgerSection } from './sections-features';

/** Development-only catalog of the base components (route `/ui`). */
export function UiCatalogScreen() {
  return (
    <Screen
      header={
        <TopBar
          title="Catálogo de UI"
          subtitle="Somente em desenvolvimento"
          leading="back"
          fallbackHref="/"
        />
      }
      contentClassName="gap-6 pb-12"
    >
      <Text variant="caption" tone="subtle">
        Todos os dados desta tela são fictícios.
      </Text>
      <TypographySection />
      <IconsSection />
      <ValuesSection />
      <ButtonsSection />
      <InputsSection />
      <SelectionSection />
      <DisplaySection />
      <ChartsSection />
      <LedgerSection />
      <FeedbackSection />
      <LayoutSection />
    </Screen>
  );
}
