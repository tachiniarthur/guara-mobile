import type { Cents } from '@guara/types';
import { cents } from '@guara/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon, PlusIcon, SettingsIcon, Trash2Icon } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import {
  Button,
  DeltaBadge,
  EmptyValue,
  FormField,
  IconButton,
  Input,
  MoneyInput,
  MoneyText,
  PercentText,
  SearchInput,
  Text,
} from '@/components/ui';

import { CatalogSection, Example } from './CatalogSection';

export function TypographySection() {
  return (
    <CatalogSection title="Text" note="Escala tipográfica (Inter) e tons semânticos.">
      <Text variant="display">Display 32</Text>
      <Text variant="title">Título 24</Text>
      <Text variant="subtitle">Subtítulo 18</Text>
      <Text variant="body">Corpo 16 — texto padrão das telas.</Text>
      <Text variant="label">Rótulo 14</Text>
      <Text variant="caption">Legenda 13</Text>
      <View className="flex-row flex-wrap gap-x-4 gap-y-1">
        {(
          [
            'default',
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

export function ValuesSection() {
  return (
    <CatalogSection
      title="Valores"
      note="MoneyText, PercentText, DeltaBadge e EmptyValue. Valores fictícios; dígitos tabulares."
    >
      <Example label="MoneyText — entrada com sinal e cor">
        <MoneyText value={cents(523_450)} showSign colorBySign variant="title" />
      </Example>
      <Example label="MoneyText — saída">
        <MoneyText value={cents(-8_990)} colorBySign />
      </Example>
      <Example label="MoneyText — compacto / oculto / sem dado">
        <View className="flex-row gap-6">
          <MoneyText value={cents(12_345_678)} compact />
          <MoneyText value={cents(12_345_678)} masked />
          <MoneyText value={null} />
        </View>
      </Example>
      <Example label="PercentText">
        <View className="flex-row gap-6">
          <PercentText value={11.65} />
          <PercentText value={-3.2} showSign colorBySign fractionDigits={1} />
          <PercentText value={null} />
        </View>
      </Example>
      <Example label="DeltaBadge">
        <View className="gap-2">
          <DeltaBadge value={2.3} label="vs mês anterior" />
          <DeltaBadge value={-0.8} label="vs CDI" />
          <DeltaBadge value={8.4} label="gastos vs média" invertColors />
          <DeltaBadge value={0} label="vs mês anterior" />
          <DeltaBadge value={null} />
        </View>
      </Example>
      <Example label="EmptyValue">
        <EmptyValue />
      </Example>
    </CatalogSection>
  );
}

export function ButtonsSection() {
  const [loading, setLoading] = useState(false);
  const simulate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <CatalogSection title="Button e IconButton" note="Variantes, tamanhos e estados.">
      <View className="flex-row flex-wrap gap-2">
        <Button onPress={simulate} loading={loading}>
          Primário
        </Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">Fantasma</Button>
        <Button variant="destructive" leftIcon={Trash2Icon}>
          Excluir
        </Button>
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        <Button size="sm">Pequeno</Button>
        <Button size="md">Médio</Button>
        <Button size="lg" rightIcon={ArrowRightIcon}>
          Grande
        </Button>
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Button disabled>Desabilitado</Button>
        <Button loading>Carregando</Button>
      </View>
      <Button fullWidth leftIcon={PlusIcon}>
        Largura total
      </Button>
      <View className="flex-row gap-2">
        <IconButton icon={SettingsIcon} accessibilityLabel="Configurações" />
        <IconButton icon={PlusIcon} variant="secondary" accessibilityLabel="Adicionar" />
        <IconButton icon={PlusIcon} variant="primary" accessibilityLabel="Adicionar" />
        <IconButton icon={PlusIcon} disabled accessibilityLabel="Adicionar (desabilitado)" />
      </View>
    </CatalogSection>
  );
}

const budgetSchema = z.object({
  name: z.string().min(1, 'Informe um nome para o teto'),
  limit: z
    .number({ error: 'Informe o valor do teto' })
    .int()
    .positive('O valor precisa ser maior que zero'),
});
type BudgetForm = z.infer<typeof budgetSchema>;

export function InputsSection() {
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState<Cents | null>(null);
  const { control, handleSubmit } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: '' },
  });

  return (
    <CatalogSection
      title="Entradas"
      note="Input, SearchInput, MoneyInput e FormField (react-hook-form + zod)."
    >
      <Input label="Nome" placeholder="Como quer chamar?" helperText="Aparece na lista de tetos." />
      <Input label="E-mail" value="email-invalido" errorMessage="Informe um e-mail válido" />
      <Input label="Desabilitado" value="Não editável" disabled />
      <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar lançamentos" />
      <MoneyInput
        label="Valor (digite só números)"
        value={amount}
        onChangeValue={setAmount}
        helperText={`Centavos: ${amount ?? 'null'}`}
      />
      <View className="gap-3 rounded-lg border border-border p-3">
        <Text variant="label" tone="muted">
          FormField — toque em Validar com os campos vazios
        </Text>
        <FormField control={control} name="name" label="Nome do teto" placeholder="Mercado" />
        <FormField control={control} name="limit" type="money" label="Teto mensal" />
        <Button variant="secondary" onPress={handleSubmit(() => undefined)}>
          Validar
        </Button>
      </View>
    </CatalogSection>
  );
}
