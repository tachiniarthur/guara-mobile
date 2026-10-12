import { cents, formatCents } from '@guara/utils';

import { POSITIONS } from '../../data';
import {
  allocationByGroup,
  barScale,
  biggestGap,
  differenceText,
  differenceTone,
  directionText,
  gapText,
  outOfTarget,
  rebalanceSuggestion,
  shareText,
  shareToMove,
} from '../allocation';

const brl = (value: number) => formatCents(value as never).replace(/ /g, ' ');

describe('allocation by group', () => {
  const { total, groups } = allocationByGroup(POSITIONS, 'moderate');
  const group = (label: string) => groups.find((item) => item.label === label)!;

  it('derives the portfolio of the design from the positions', () => {
    expect(brl(total)).toBe('R$ 48.310,90');
    expect(groups.map((item) => [item.current, item.target])).toEqual([
      [46, 48],
      [0, 14],
      [36.2, 19],
      [7.9, 14],
      [9.9, 5],
    ]);
    expect(groups.map((item) => differenceText(item.difference))).toEqual([
      '−2 p.p.',
      '−14 p.p.',
      '+17,2 p.p.',
      '−6,1 p.p.',
      '+4,9 p.p.',
    ]);
  });

  it('lists the subclasses with what the user holds', () => {
    const equity = group('Renda variável Brasil').subclasses;
    expect(equity.map((item) => item.label)).toEqual([
      'Ações large cap',
      'Ações small caps',
      'FIIs',
    ]);
    expect(equity[0]!.holdings?.label).toBe('PETR4 e BOVA11');
    expect(brl(equity[0]!.holdings!.value)).toBe('R$ 10.691,50');
    expect(equity[0]!.current).toBe(22.1);
    expect(equity[1]!.holdings).toBeNull();
    const intl = group('Renda variável internacional').subclasses;
    expect(intl[1]!.holdings?.label).toBe('5 BDRs');
    expect(differenceText(intl[1]!.difference)).toBe('no alvo');
    expect(group('Renda fixa Brasil').subclasses[0]!.holdings?.label).toBe(
      'Tesouro Selic, CDB/LCI/LCA pós, fundos DI',
    );
  });

  it('says how far each group is from the target, in reais', () => {
    expect(brl(group('Renda fixa Brasil').targetValue)).toBe('R$ 23.189,23');
    expect(brl(-group('Renda fixa Brasil').gap)).toBe('R$ 967,13');
    expect(brl(group('Renda variável Brasil').gap)).toBe('R$ 8.287,03');
    // The design says 2.383,02, but its own target (2.415,55) gives 2.383,01.
    expect(brl(group('Cripto').gap)).toBe('R$ 2.383,01');
  });

  it('finds the groups out of target and the biggest gap', () => {
    expect(outOfTarget(groups).map((item) => item.label)).toEqual([
      'Renda variável Brasil',
      'Renda fixa internacional',
      'Renda variável internacional',
    ]);
    expect(biggestGap(groups)?.label).toBe('Renda variável Brasil');
    expect(directionText(17.2)).toBe('17,2 p.p. acima');
    expect(directionText(-14)).toBe('14 p.p. abaixo');
  });

  it('measures how much would change group for each profile', () => {
    expect(shareToMove(groups)).toBe(22.1);
    expect(shareToMove(allocationByGroup(POSITIONS, 'conservative').groups)).toBe(42);
  });

  it('suggests contributions to the groups below the target', () => {
    expect(rebalanceSuggestion(groups, cents(150000))).toBe(
      'Dá para chegar mais perto do alvo sem vender nada: se os próximos aportes forem para renda fixa internacional e renda variável internacional, a parte de renda variável Brasil vai diminuindo. Quer que eu simule com R$\u00a01.500 por mês?',
    );
    // Conservador: renda fixa below; renda variável Brasil and cripto more than 5 p.p. above.
    expect(
      rebalanceSuggestion(allocationByGroup(POSITIONS, 'conservative').groups, cents(150000)),
    ).toMatch(
      /para renda fixa Brasil e renda fixa internacional, as partes de renda variável Brasil e cripto vão diminuindo/,
    );
    expect(rebalanceSuggestion([], cents(150000))).toBeNull();
  });
});

describe('allocation texts', () => {
  it('formats shares, differences and tones', () => {
    expect(shareText(46)).toBe('46%');
    expect(shareText(36.2)).toBe('36,2%');
    expect(differenceTone(-2)).toBe('close');
    expect(differenceTone(4.9)).toBe('above');
    expect(differenceTone(-6.1)).toBe('below');
    expect(barScale([48, 46, 36.2])).toBe(60);
    expect(barScale([75, 46], 40)).toBe(80);
    expect(gapText(cents(0))).toBeNull();
    expect(gapText(cents(-96713))?.replace(/\u00a0/g, ' ')).toBe('faltam R$ 967,13');
    expect(gapText(cents(828703))?.replace(/\u00a0/g, ' ')).toBe('R$ 8.287,03 acima');
  });
});
