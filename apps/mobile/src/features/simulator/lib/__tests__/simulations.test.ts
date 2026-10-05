import { GOAL_DEFAULTS, GOAL_PLACES, HOUSEHOLD, RETIREMENT_DEFAULTS } from '../../data';
import { simulateCut } from '../cut';
import { simulateGoal } from '../goal';
import { simulateRetirement } from '../retirement';

/** `formatCents` separates "R$" with a no-break space. */
const plain = (text: string) => text.replace(/\u00a0/g, ' ');

const retirement = simulateRetirement({ ...RETIREMENT_DEFAULTS, start: HOUSEHOLD.invested });

describe('retirement (design numbers)', () => {
  it('needs R$ 3,0 milhões and R$ 5.640 a month', () => {
    expect(retirement.goal).toBe(3_000_000);
    expect(retirement.deposit).toBe(5640);
    expect(Math.round(retirement.incomeShare)).toBe(69);
  });

  it('compares the profiles', () => {
    expect(retirement.profiles.map((profile) => profile.deposit)).toEqual([6540, 5640, 4840]);
  });

  it('splits contributions and interest', () => {
    expect(retirement.contributed / 1e6).toBeCloseTo(1.74, 2);
    expect(retirement.interest / 1e6).toBeCloseTo(1.26, 2);
  });

  it('dates the milestones', () => {
    expect(retirement.milestones.map((step) => step.year)).toEqual([2032, 2037, 2045, 2051]);
  });

  it('answers "E se…"', () => {
    expect(retirement.alternatives.map((item) => item.deposit)).toEqual([4150, 4460, 5540, 4840]);
    expect(retirement.alternatives.map((item) => plain(item.detail))).toEqual([
      'em 2056, com 30 anos de aportes · −R$ 1.490',
      'patrimônio de R$ 2,4 mi · −R$ 1.180',
      'usando parte da reserva · −R$ 100',
      'carteira mais arrojada · −R$ 800',
    ]);
    expect(plain(retirement.alternatives[1]?.title ?? '')).toBe('Pedir R$ 8.000 por mês');
  });

  it('compares with the surplus', () => {
    expect(Math.round(retirement.budget.gap)).toBe(3352);
    expect(retirement.budget.surplusFinal / 1e6).toBeCloseTo(1.29, 2);
    expect(Math.round(retirement.budget.surplusIncome)).toBe(4309);
  });
});

describe('goal (design numbers)', () => {
  const rate = GOAL_PLACES[0].monthlyRate;
  const goal = simulateGoal({ ...GOAL_DEFAULTS, rate }, HOUSEHOLD.surplus, 312);

  it('saves R$ 1.310 a month', () => {
    expect(goal.deposit).toBe(1310);
    expect(Math.round(goal.surplusShare)).toBe(57);
    expect(goal.scenarios.map((scenario) => scenario.deposit)).toEqual([2030, 1310, 940]);
  });

  it('reaches the milestones in jan/27, jun/27, dez/27 and abr/28', () => {
    expect(goal.milestones.map((step) => step.month)).toEqual([3, 8, 14, 18]);
  });

  it('splits saved, deposits and yield', () => {
    const { saved, deposits, yield: earned } = goal.composition;
    const total = saved + deposits + earned;
    expect(Math.round((saved / total) * 100)).toBe(13);
    expect(Math.round((deposits / total) * 100)).toBe(78);
    expect(Math.round((earned / total) * 100)).toBe(9);
  });

  it('answers "E se…"', () => {
    expect(goal.alternatives.map((item) => item.months)).toEqual([23, 15, 15]);
    expect(goal.withReserve).toBe(2300);
  });
});

describe('cut (design numbers)', () => {
  const cut = simulateCut({ average: 390, percent: 80, rate: 4 });

  it('saves R$ 312 a month with a R$ 78 cap', () => {
    expect(cut?.savings).toBe(312);
    expect(cut?.cap).toBe(78);
    expect(cut?.yearly).toBe(3744);
    expect(Math.round((cut?.tenYears ?? 0) / 1000)).toBe(46);
    expect(cut?.scenarios.map((scenario) => scenario.savings)).toEqual([117, 195, 312]);
    expect(cut?.alerts).toEqual([40, 60]);
    expect(cut?.reserveMonths).toBe(45);
  });

  it('grows over time', () => {
    expect(cut?.horizons.map((item) => Math.round(item.value / 1000))).toEqual([4, 21, 46, 159]);
  });

  it('needs spending history', () => {
    expect(simulateCut({ average: null, percent: 80, rate: 4 })).toBeNull();
  });
});
