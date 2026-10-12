import { cents } from '@guara/utils';

import { PRICE_ALERTS, QUOTES } from '../../data';
import {
  carameloText,
  closeness,
  conditionText,
  formatPrice,
  historyLabels,
  niceTicks,
  reached,
  remainingText,
  tickLabel,
} from '../price-alerts';

const plain = (text: string) => text.replace(/ /g, ' ');
const [btc, petr4, ivvb11] = PRICE_ALERTS as [
  (typeof PRICE_ALERTS)[0],
  (typeof PRICE_ALERTS)[0],
  (typeof PRICE_ALERTS)[0],
];

describe('price alerts', () => {
  it('measures the distance from the current price', () => {
    // The design shows 5,4% for the Bitcoin; from R$ 615.200 to R$ 650.000 it is 5,7%.
    expect(remainingText('sell', QUOTES.BTC!.price, btc.targetPrice)).toBe('faltam 5,7%');
    expect(remainingText('buy', QUOTES.PETR4!.price, petr4.targetPrice)).toBe('faltam 10,1%');
    expect(remainingText('buy', QUOTES.IVVB11!.price, ivvb11.targetPrice)).toBe('faltam 6,1%');
    expect(reached('sell', cents(65_130_000), btc.targetPrice)).toBe(true);
    expect(reached('buy', cents(3_500), petr4.targetPrice)).toBe(false);
    expect(closeness(QUOTES.BTC!.price, btc.targetPrice)).toBe(95);
  });

  it('writes prices and conditions like the design', () => {
    expect(plain(formatPrice(cents(65_000_000)))).toBe('R$ 650.000');
    expect(plain(formatPrice(cents(3_400)))).toBe('R$ 34,00');
    expect(plain(conditionText(btc, QUOTES.BTC!))).toBe(
      'Quando subir a R$ 650.000 · agora R$ 615.200',
    );
    expect(plain(conditionText(petr4, QUOTES.PETR4!))).toBe(
      'Quando cair a R$ 34,00 · agora R$ 37,82',
    );
  });

  it('lets the Caramelo explain a triggered alert', () => {
    const triggered = {
      ...btc,
      status: 'triggered' as const,
      triggeredAt: '2026-09-23T18:12:00.000Z',
      triggeredPrice: cents(65_130_000),
    };
    expect(plain(carameloText(triggered, QUOTES.BTC!))).toBe(
      'Au! O Bitcoin passou de R$ 650.000 às 15:12. Avisei no celular e no e-mail. Pausei o alerta: quer renovar com outro alvo ou encerrar?',
    );
  });

  it('scales the chart with round grid lines', () => {
    expect(niceTicks(553_600, 650_000)).toEqual([550_000, 600_000, 650_000]);
    expect(tickLabel(550_000)).toBe('550 mil');
    expect(tickLabel(34)).toBe('R$ 34');
    expect(historyLabels('2026-08-25', 30).map((item) => item.label)).toEqual([
      '25/08',
      '04/09',
      '13/09',
      '23/09',
    ]);
  });
});
