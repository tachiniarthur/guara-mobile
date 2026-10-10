import type { Cents, DecimalString } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatCents, isDecimalString, multiplyCentsByDecimal } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { FormScreen, ResponsiveGrid } from '@/components/layout';
import { Icon, InfoNote, Input, MoneyInput, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { useProfileTargets } from '../hooks/useProfileTargets';
import { ChatEntryTip, InvestmentTypePicker, PositionPreview } from '../components';
import { ASSET_CLASSES, PORTFOLIO } from '../data';
import {
  NEW_ASSET_EXAMPLE,
  NEW_ASSET_NOTES,
  QUOTE_TIME,
  QUOTED_ASSETS,
  type InvestmentType,
} from '../new-asset';

/** "200" or "0,0078" → DecimalString; anything else → null. */
function parseQuantity(text: string): DecimalString | null {
  const normalized = text.trim().replace(/\./g, '').replace(',', '.');
  if (!isDecimalString(normalized) || Number(normalized) <= 0) return null;
  return normalized;
}

/** Typing "12032026" shows "12/03/2026". */
function maskDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

function isValidDate(text: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return false;
  const [, day = 0, month = 0, year = 0] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Adicionar investimento: type, asset, quantity, average price and a preview of the position. */
export function NewManualAssetScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const params = useLocalSearchParams<{ ticker?: string }>();
  const initial =
    params.ticker && params.ticker !== NEW_ASSET_EXAMPLE.ticker
      ? { ticker: params.ticker, quantity: '', averagePrice: null, date: '' }
      : NEW_ASSET_EXAMPLE;

  const [type, setType] = useState<InvestmentType>('listed');
  const [ticker, setTicker] = useState<string>(initial.ticker);
  const [quantity, setQuantity] = useState<string>(initial.quantity);
  const [averagePrice, setAveragePrice] = useState<Cents | null>(initial.averagePrice);
  const [date, setDate] = useState<string>(initial.date);
  const [institution, setInstitution] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const quote = QUOTED_ASSETS.find((asset) => asset.ticker === ticker.trim().toUpperCase());
  const amount = parseQuantity(quantity);
  const invested =
    amount && averagePrice !== null ? multiplyCentsByDecimal(averagePrice, amount) : null;
  const worth = amount && quote ? multiplyCentsByDecimal(quote.price, amount) : null;
  const profile = useProfileTargets();
  const assetClass = quote ? ASSET_CLASSES.find((item) => item.key === quote.classKey) : undefined;
  const classValue = assetClass ? (assetClass.current / 100) * PORTFOLIO.total : 0;

  const errors = {
    ticker: quote
      ? undefined
      : ticker.trim()
        ? 'Não encontramos esse código. Confira e tente de novo.'
        : 'Informe o ativo.',
    quantity: amount ? undefined : 'Informe a quantidade.',
    averagePrice: averagePrice ? undefined : 'Informe o preço médio.',
    date: isValidDate(date) ? undefined : 'Use o formato dd/mm/aaaa.',
  };
  const shown = (key: keyof typeof errors) =>
    submitted || key === 'ticker' ? errors[key] : undefined;

  const changeType = (next: InvestmentType) => {
    if (next === 'property') router.replace('/new-property');
    else if (next === 'vehicle') router.replace('/new-vehicle');
    else setType(next);
  };

  const save = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) {
      toast.error('Confira os campos destacados');
      return;
    }
    toast.success('Investimento salvo');
    if (router.canGoBack()) router.back();
    else router.replace('/investments');
  };

  const form = (
    <View className="gap-5">
      <View className="gap-2">
        <Text variant="label" accessibilityRole="header">
          Tipo
        </Text>
        <InvestmentTypePicker value={type} onChange={changeType} wide={isTablet} />
        <InfoNote icon="home" tone="plain" size={13} className="mt-1">
          {NEW_ASSET_NOTES.properties}
        </InfoNote>
      </View>
      <Input
        label="Ativo"
        leftIcon="search"
        strong
        value={ticker}
        onChangeText={setTicker}
        autoCapitalize="characters"
        autoCorrect={false}
        errorMessage={shown('ticker')}
        helper={
          quote ? (
            <>
              <Icon name="check" size={14} strokeWidth={2.4} color={colors.positive.DEFAULT} />
              <Text size={13} tone="muted" className="flex-1">
                {quote.name} · cotação às {QUOTE_TIME}: {formatCents(quote.price)}
              </Text>
            </>
          ) : undefined
        }
      />
      <ResponsiveGrid columns={{ tablet: 2 }} gap={14}>
        <Input
          label="Quantidade"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          errorMessage={shown('quantity')}
        />
        <MoneyInput
          label="Preço médio de compra"
          value={averagePrice}
          onChangeValue={setAveragePrice}
          errorMessage={shown('averagePrice')}
        />
      </ResponsiveGrid>
      <ResponsiveGrid columns={{ tablet: 2 }} gap={14}>
        <Input
          label="Data da compra"
          value={date}
          onChangeText={(text) => setDate(maskDate(text))}
          keyboardType="number-pad"
          placeholder="dd/mm/aaaa"
          maxLength={10}
          errorMessage={shown('date')}
        />
        <Input
          label="Instituição (opcional)"
          value={institution}
          onChangeText={setInstitution}
          placeholder="Ex.: sua corretora"
        />
      </ResponsiveGrid>
    </View>
  );

  return (
    <FormScreen
      title="Adicionar investimento"
      parents={[{ label: 'Investimentos', href: '/investments' }]}
      current="Adicionar"
      fallbackHref="/investments"
      submit={{ label: 'Salvar investimento', icon: 'check', onPress: save }}
      contentClassName="gap-4 pt-1"
    >
      {isTablet ? (
        <View className="gap-4 rounded-24 border border-border bg-surface p-6">{form}</View>
      ) : (
        form
      )}
      <PositionPreview
        quantity={quantity.trim()}
        averagePrice={averagePrice}
        invested={invested}
        worth={worth}
        portfolio={PORTFOLIO.total}
        allocation={
          assetClass && quote && worth !== null
            ? {
                label: assetClass.label,
                ticker: quote.ticker,
                color: assetClass.color,
                profile: profile.label,
                current: assetClass.current,
                after: ((classValue + worth) / (PORTFOLIO.total + worth)) * 100,
                target: profile.targets[assetClass.key],
              }
            : null
        }
        wide={isTablet}
      />
      <ChatEntryTip />
      <InfoNote icon="copy" tone="plain" size={13}>
        {NEW_ASSET_NOTES.duplicates}
      </InfoNote>
    </FormScreen>
  );
}
