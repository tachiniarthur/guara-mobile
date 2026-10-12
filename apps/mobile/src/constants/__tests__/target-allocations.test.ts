import {
  ALLOCATION_GROUPS,
  SUBCLASSES,
  TARGET_ALLOCATIONS,
  groupTargets,
  subclassLabel,
} from '../target-allocations';

describe('target allocations', () => {
  it('each profile adds up to 100%', () => {
    for (const subclasses of Object.values(TARGET_ALLOCATIONS)) {
      expect(subclasses.reduce((sum, item) => sum + item.share, 0)).toBe(100);
    }
  });

  it('keeps the groups of the rule, in the order of the design', () => {
    const order = (type: keyof typeof TARGET_ALLOCATIONS) =>
      ALLOCATION_GROUPS.map((group) => groupTargets(type)[group.key]);
    expect(order('conservative')).toEqual([75, 13, 6, 4, 2]);
    expect(order('moderate')).toEqual([48, 14, 19, 14, 5]);
    expect(order('aggressive')).toEqual([23, 15, 30, 20, 12]);
    expect(order('sophisticated')).toEqual([13, 22, 25, 25, 15]);
  });

  it('counts the subclasses of each profile', () => {
    expect(TARGET_ALLOCATIONS.conservative).toHaveLength(10);
    expect(TARGET_ALLOCATIONS.moderate).toHaveLength(13);
  });

  it('uses the name each profile gives a subclass', () => {
    expect(subclassLabel('conservative', 'largeCaps')).toBe('Ações large cap/blue chips');
    expect(subclassLabel('moderate', 'largeCaps')).toBe('Ações large cap');
    expect(subclassLabel('moderate', 'intlStocks')).toBe('Ações diretas/BDRs');
    expect(SUBCLASSES.postFixed.description).toBe('Tesouro Selic, CDB/LCI/LCA pós, fundos DI');
  });
});
