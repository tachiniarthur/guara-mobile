import { cents } from '@guara/utils';

/** Novo alerta de preço as shown in the design (Bitcoin; static until the API exists). */
export const ALERT_ASSET = {
  name: 'Bitcoin (BTC)',
  shortName: 'Bitcoin',
  quoteLabel: 'Cotação às 14:30',
  price: cents(61_520_000),
  high: cents(62_420_000),
  low: cents(55_360_000),
  history: [
    560000, 576900, 575500, 577800, 595600, 602800, 593900, 595800, 607000, 601000, 586200, 587800,
    591500, 576600, 564100, 569700, 569900, 555700, 553600, 566600, 567400, 560500, 571700, 589400,
    590400, 591000, 609800, 624300, 620800, 615200,
  ],
  xLabels: [
    { index: 0, label: '24 ago' },
    { index: 8, label: '1 set' },
    { index: 15, label: '8 set' },
    { index: 22, label: '15 set' },
    { index: 29, label: 'hoje' },
  ],
} as const;

export const SHORTCUTS = [5, 10, 20] as const;
