import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents } from '@guara/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import {
  Button,
  DeltaBadge,
  EmptyValue,
  FormField,
  Icon,
  ICON_PATHS,
  IconButton,
  Input,
  LinkButton,
  MoneyInput,
  MoneyText,
  PercentText,
  SearchInput,
  Span,
  Text,
  type IconName,
} from '@/components/ui';

import { CatalogSection, Example } from './CatalogSection';

export function TypographySection() {
  return (
    <CatalogSection
      title="Text"
      note="Fraunces (títulos e números grandes) e Figtree, com tons semânticos."
    >
      <Text variant="hero">Hero</Text>
      <Text variant="display">Display</Text>
      <Text variant="title">Título</Text>
      <Text variant="section">Seção</Text>
      <Text variant="heading">Heading</Text>
      <Text variant="subtitle">Subtítulo</Text>
      <Text variant="body">
        Corpo — texto padrão das telas, com <Span weight="bold">trecho em negrito</Span>.
      </Text>
      <Text variant="label">Rótulo</Text>
      <Text variant="caption">Legenda</Text>
      <Text variant="micro">MICRO</Text>
      <View className="flex-row flex-wrap gap-x-4 gap-y-1">
        {(
          [
            'default',
            'soft',
            'muted',
            'subtle',
            'positive',
            'negative',
            'warning',
            'info',
            'brand',
          ] as const
        ).map((tone) => (
          <Text key={tone} tone={tone} variant="label">
            {tone}
          </Text>
        ))}
      </View>
    </CatalogSection>
  );
}

export function IconsSection() {
  return (
    <CatalogSection title="Icon" note="Ícones de traço do design (24×24). Cores sempre de tokens.">
      <View className="flex-row flex-wrap gap-3">
        {(Object.keys(ICON_PATHS) as IconName[]).map((name) => (
          <View key={name} className="w-[76px] items-center gap-1">
            <Icon name={name} size={22} color={colors.foreground.DEFAULT} />
            <Text size={10} tone="subtle" numberOfLines={1}>
              {name}
            </Text>
          </View>
        ))}
      </View>
    </CatalogSection>
  );
}

export function ValuesSection() {
  return (
    <CatalogSection
      title="Valores"
      note="MoneyText, PercentText, DeltaBadge e EmptyValue — nunca formate à mão."
    >
      <MoneyText value={cents(123_456)} variant="heading" />
      <MoneyText value={cents(-4_990)} colorBySign showSign />
      <MoneyText value={cents(615_200_00)} wholeUnits />
      <MoneyText value={cents(123_456)} masked />
      <PercentText value={12.4} showSign colorBySign />
      <View className="flex-row gap-2">
        <DeltaBadge value={3.2} />
        <DeltaBadge value={-1.8} />
        <DeltaBadge value={null} />
      </View>
      <EmptyValue />
    </CatalogSection>
  );
}

export function ButtonsSection() {
  return (
    <CatalogSection
      title="Button, IconButton e LinkButton"
      note="Pílulas de 36, 44 ou 52; ícones à esquerda ou à direita."
    >
      {(
        [
          'primary',
          'inverse',
          'secondary',
          'outline',
          'ghost',
          'destructive',
          'negativeOutline',
        ] as const
      ).map((variant) => (
        <Button key={variant} variant={variant} size="md" leftIcon="plus">
          {variant}
        </Button>
      ))}
      <Example label="tamanhos">
        <View className="flex-row flex-wrap items-center gap-2">
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg" rightIcon="arrowRight">
            lg
          </Button>
        </View>
      </Example>
      <Example label="estados">
        <View className="flex-row flex-wrap gap-2">
          <Button size="md" loading>
            Salvando
          </Button>
          <Button size="md" disabled>
            Desabilitado
          </Button>
        </View>
      </Example>
      <Example label="IconButton">
        <View className="flex-row gap-2">
          {(['ghost', 'outline', 'filled', 'primary'] as const).map((variant) => (
            <IconButton key={variant} icon="bell" variant={variant} accessibilityLabel={variant} />
          ))}
        </View>
      </Example>
      <LinkButton label="Ver todos" chevron onPress={() => undefined} />
    </CatalogSection>
  );
}

const schema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  limit: z.number().int().positive('Informe um valor'),
});

export function InputsSection() {
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState<Cents | null>(null);
  const { control, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', limit: undefined },
  });

  return (
    <CatalogSection
      title="Campos"
      note="Input, SearchInput, MoneyInput e FormField (react-hook-form + zod)."
    >
      <Input label="Nome" placeholder="Como quer chamar?" helperText="Aparece na lista de tetos." />
      <Input label="Ativo" leftIcon="search" strong value="PETR4" />
      <Input label="E-mail" value="email-invalido" errorMessage="Informe um e-mail válido" />
      <Input label="Desabilitado" value="Não editável" disabled />
      <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar lançamentos" />
      <MoneyInput
        label="Valor (digite só números)"
        value={amount}
        onChangeValue={setAmount}
        helperText={`Centavos: ${amount ?? 'null'}`}
      />
      <View className="gap-3 rounded-16 border border-border p-3">
        <Text variant="caption" tone="subtle">
          FormField — toque em Validar com os campos vazios
        </Text>
        <FormField control={control} name="name" label="Nome do teto" placeholder="Mercado" />
        <FormField control={control} name="limit" type="money" label="Teto mensal" />
        <Button variant="secondary" size="md" onPress={handleSubmit(() => undefined)}>
          Validar
        </Button>
      </View>
    </CatalogSection>
  );
}
