import { TARGET_ALLOCATIONS, classTargets, groupShare } from '../target-allocations';

describe('target allocations', () => {
  it('each profile adds up to 100%', () => {
    for (const groups of Object.values(TARGET_ALLOCATIONS)) {
      expect(groups.reduce((sum, group) => sum + groupShare(group), 0)).toBe(100);
    }
  });

  it('keeps the groups of the rule', () => {
    expect(TARGET_ALLOCATIONS.conservative.map(groupShare)).toEqual([75, 13, 6, 4, 2]);
    expect(TARGET_ALLOCATIONS.moderate.map(groupShare)).toEqual([48, 14, 19, 14, 5]);
    expect(TARGET_ALLOCATIONS.aggressive.map(groupShare)).toEqual([23, 15, 30, 20, 12]);
    expect(TARGET_ALLOCATIONS.sophisticated.map(groupShare)).toEqual([13, 22, 25, 25, 15]);
  });

  it('maps to the classes of Investimentos', () => {
    expect(classTargets('conservative')).toEqual({
      fixed: 75,
      stocks: 4,
      reits: 2,
      crypto: 2,
      intl: 17,
    });
    expect(classTargets('moderate')).toEqual({
      fixed: 48,
      stocks: 13,
      reits: 6,
      crypto: 5,
      intl: 28,
    });
    expect(classTargets('aggressive')).toEqual({
      fixed: 23,
      stocks: 21,
      reits: 9,
      crypto: 12,
      intl: 35,
    });
    expect(classTargets('sophisticated')).toEqual({
      fixed: 13,
      stocks: 15,
      reits: 10,
      crypto: 15,
      intl: 47,
    });
  });
});
