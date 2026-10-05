import { Link, type Href } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';

export interface Crumb {
  label: string;
  href: Href;
}

export interface BreadcrumbProps {
  parents: Crumb[];
  /** The current page (bold, not a link). */
  current: string;
}

/** Tablet path above the page title ("Investimentos / PETR4"). */
export function Breadcrumb({ parents, current }: BreadcrumbProps) {
  return (
    <View accessibilityRole="summary" className="flex-row items-center gap-2">
      {parents.map((crumb) => (
        <View key={crumb.label} className="flex-row items-center gap-2">
          <Link href={crumb.href} accessibilityRole="link">
            <Text size={14} tone="muted" underline>
              {crumb.label}
            </Text>
          </Link>
          <Text size={14} tone="subtle" accessibilityElementsHidden>
            /
          </Text>
        </View>
      ))}
      <Text size={14} weight="bold">
        {current}
      </Text>
    </View>
  );
}
