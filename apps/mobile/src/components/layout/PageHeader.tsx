import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

import { Breadcrumb, type Crumb } from './Breadcrumb';

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Path above the title on tablets ("Alertas / Novo teto"). The last item is the page. */
  breadcrumb?: { parents: Crumb[]; current: string };
  /** Right side (pills, buttons). */
  actions?: ReactNode;
  /** Title size: 28 (default, inner pages) or 36 (Início). */
  size?: 28 | 30 | 34 | 36;
  className?: string;
}

/** Tablet page header: breadcrumb, Fraunces title and actions aligned to the bottom. */
export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  size = 28,
  className,
}: PageHeaderProps) {
  return (
    <View className={cn('gap-5', className)}>
      {breadcrumb ? <Breadcrumb parents={breadcrumb.parents} current={breadcrumb.current} /> : null}
      <View className="flex-row flex-wrap items-end justify-between gap-4">
        <View className="min-w-0 flex-1 gap-1.5">
          <Text
            variant="display"
            size={size}
            leading={size === 36 ? 1.1 : 1.15}
            tracking={size === 36 ? -0.02 : -0.01}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {typeof subtitle === 'string' ? (
            <Text size={size === 36 ? 16 : 15} tone="muted">
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}
        </View>
        {actions ? <View className="flex-row items-center gap-2">{actions}</View> : null}
      </View>
    </View>
  );
}
