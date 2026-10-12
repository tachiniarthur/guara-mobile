import type { Cents, IsoDate, NotificationChannel, PriceAlertSide } from '@guara/types';
import { formatCents, formatDate, formatPercent, joinList } from '@guara/utils';
import { addDays } from 'date-fns';

import type { AssetQuote, PriceAlertItem } from '../data';

/** Prices from R$ 1.000 drop the cents ("R$ 650.000", but "R$ 34,00"). */
export function formatPrice(value: Cents): string {
  return formatCents(value, { wholeUnits: Math.abs(value) >= 100_000 });
}

/** How far the price has to move to reach the target, in % of the current price. */
export function distancePercent(current: Cents, target: Cents): number {
  return ((target - current) / current) * 100;
}

/** Sell alerts fire when the price rises to the target; buy alerts when it falls to it. */
export function reached(side: PriceAlertSide, current: Cents, target: Cents): boolean {
  return side === 'sell' ? current >= target : current <= target;
}

/** "faltam 5,7%" or "atingido". */
export function remainingText(side: PriceAlertSide, current: Cents, target: Cents): string {
  if (reached(side, current, target)) return 'atingido';
  return `faltam ${formatPercent(Math.abs(distancePercent(current, target)), { fractionDigits: 1 })}`;
}

/** How close the price is to the target (0–100), for the bar of the list. */
export function closeness(current: Cents, target: Cents): number {
  return Math.round((Math.min(current, target) / Math.max(current, target)) * 100);
}

export const SIDE_LABEL: Record<PriceAlertSide, string> = { buy: 'COMPRA', sell: 'VENDA' };
export const SIDE_WORD: Record<PriceAlertSide, string> = { buy: 'compra', sell: 'venda' };
export const SIDE_HINT: Record<PriceAlertSide, string> = {
  buy: 'avisar quando cair até',
  sell: 'avisar quando subir até',
};

/** "Quando subir a R$ 650.000 · agora R$ 615.200". */
export function conditionText(alert: PriceAlertItem, quote: AssetQuote): string {
  return `Quando ${alert.side === 'sell' ? 'subir' : 'cair'} a ${formatPrice(alert.targetPrice)} · agora ${formatPrice(quote.price)}`;
}

/** "Venda · avisar quando subir". */
export function typeText(side: PriceAlertSide): string {
  return `${side === 'sell' ? 'Venda' : 'Compra'} · avisar quando ${side === 'sell' ? 'subir' : 'cair'}`;
}

const CHANNEL: Record<NotificationChannel, string> = { push: 'celular', email: 'e-mail' };

/** "no celular e no e-mail". */
export function channelsPlace(channels: readonly NotificationChannel[]): string {
  return joinList(channels.map((channel) => `no ${CHANNEL[channel]}`));
}

/** "Celular e e-mail". */
export function channelsText(channels: readonly NotificationChannel[]): string {
  const text = joinList(channels.map((channel) => CHANNEL[channel]));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const STATUS_TEXT: Record<PriceAlertItem['status'], string> = {
  active: 'Ativo · confere a cada cotação',
  paused: 'Pausado por você',
  triggered: 'Pausado depois do aviso',
};

/** "Hoje, 15:12" or "21/09, 19:02". */
export function whenText(at: string, today: IsoDate): string {
  const day = formatDate(at, 'yyyy-MM-dd');
  return day === today ? `Hoje, ${formatDate(at, 'HH:mm')}` : formatDate(at, 'dd/MM, HH:mm');
}

/** The Caramelo's line on the alert page. */
export function carameloText(alert: PriceAlertItem, quote: AssetQuote): string {
  const target = formatPrice(alert.targetPrice);
  if (alert.status === 'triggered' && alert.triggeredAt) {
    const moved = alert.side === 'sell' ? 'passou de' : 'caiu para';
    return `Au! O ${quote.name} ${moved} ${target} às ${formatDate(alert.triggeredAt, 'HH:mm')}. Avisei ${channelsPlace(alert.channels)}. Pausei o alerta: quer renovar com outro alvo ou encerrar?`;
  }
  if (alert.status === 'paused') {
    return `Alerta pausado: não estou conferindo o ${quote.name} agora. Quando quiser, é só retomar.`;
  }
  return `Estou de olho: confiro o ${quote.name} a cada cotação e aviso uma vez quando chegar a ${target}.`;
}

/** Round steps (1, 2 or 5 × 10ⁿ) so the chart shows 2 or 3 grid lines. */
export function niceTicks(min: number, max: number): number[] {
  const raw = Math.max(1, (max - min) / 2);
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((factor) => factor * power).find((value) => value >= raw)!;
  const ticks: number[] = [];
  for (
    let value = Math.floor(min / step) * step;
    value <= Math.ceil(max / step) * step;
    value += step
  ) {
    ticks.push(value);
  }
  return ticks;
}

/** "550 mil" from R$ 1.000 up, otherwise "R$ 34". */
export function tickLabel(value: number): string {
  return value >= 1000
    ? `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
    : `R$ ${value.toLocaleString('pt-BR')}`;
}

/** Four dates under the chart ("25/08" … "23/09"). */
export function historyLabels(start: IsoDate, count: number): { index: number; label: string }[] {
  const indexes = [0, Math.round((count - 1) / 3), Math.round(((count - 1) * 2) / 3), count - 1];
  return indexes.map((index) => ({
    index,
    label: formatDate(addDays(new Date(`${start}T12:00:00Z`), index), 'dd/MM'),
  }));
}
