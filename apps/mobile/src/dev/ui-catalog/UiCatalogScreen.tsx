import { Header, Screen } from '@/components/layout';
import { Text } from '@/components/ui';

import { ButtonsSection, InputsSection, TypographySection, ValuesSection } from './sections-basics';
import { DisplaySection, FeedbackSection, LayoutSection, SelectionSection } from './sections-more';

/** Development-only catalog of the base components (route `/ui`). */
export function UiCatalogScreen() {
  return (
    <Screen scroll contentClassName="gap-6 pb-12">
      <Header title="Catálogo de UI" subtitle="Somente em desenvolvimento" large />
      <Text variant="caption" tone="subtle">
        Todos os dados desta tela são fictícios.
      </Text>
      <TypographySection />
      <ValuesSection />
      <ButtonsSection />
      <InputsSection />
      <SelectionSection />
      <DisplaySection />
      <FeedbackSection />
      <LayoutSection />
    </Screen>
  );
}
