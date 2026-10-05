import { consentEnd } from '../consent';

describe('consentEnd', () => {
  it('adds the consent months to the start day', () => {
    expect(consentEnd('2026-09-23', 12)).toBe('2027-09-23');
    expect(consentEnd('2026-10-05', 12)).toBe('2027-10-05');
  });

  it('keeps the end of short months valid', () => {
    expect(consentEnd('2027-01-31', 1)).toBe('2027-02-28');
  });
});
