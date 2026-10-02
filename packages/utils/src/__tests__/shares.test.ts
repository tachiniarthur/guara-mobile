import type { Cents } from '@guara/types';

import { sharesOf } from '../percent';

const list = (...values: number[]) => values as Cents[];
const sum = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0) * 100);

describe('sharesOf', () => {
  it('sums to exactly 100 with two decimals', () => {
    expect(sharesOf(list(1, 1, 1))).toEqual([33.34, 33.33, 33.33]);
    const shares = sharesOf(list(768400, 2318450, 1067820, 341270, 1102500));
    expect(sum(shares)).toBe(10000);
    for (const share of shares) expect(Number(share.toFixed(2))).toBe(share);
  });

  it('handles zeros and empty totals', () => {
    expect(sharesOf(list(0, 500))).toEqual([0, 100]);
    expect(sharesOf(list(0, 0))).toEqual([0, 0]);
    expect(sharesOf(list())).toEqual([]);
  });

  it('rejects negative values', () => {
    expect(() => sharesOf(list(-1, 2))).toThrow(RangeError);
  });
});
