import {
  APP_TIME_ZONE,
  formatDate,
  formatDateTime,
  formatDayLabel,
  formatMonthYear,
  formatTime,
  isSameDayInAppTimeZone,
  nowInAppTimeZone,
  parseDate,
  startOfDayInAppTimeZone,
  toISODate,
  todayISODate,
} from '../date';

describe('date helpers (America/Sao_Paulo)', () => {
  it('uses São Paulo as the app time zone', () => {
    expect(APP_TIME_ZONE).toBe('America/Sao_Paulo');
  });

  it('formats instants in São Paulo time, not UTC', () => {
    // 02:30 UTC on Oct 1st is still Sep 30th, 23:30 in São Paulo (UTC-3).
    const instant = '2026-10-01T02:30:00.000Z';
    expect(formatDate(instant)).toBe('30/09/2026');
    expect(formatDateTime(instant)).toBe('30/09/2026 23:30');
    expect(formatTime(instant)).toBe('23:30');
    expect(toISODate(instant)).toBe('2026-09-30');
  });

  it('keeps date-only strings on the same calendar day', () => {
    expect(formatDate('2026-10-01')).toBe('01/10/2026');
    expect(toISODate('2026-01-31')).toBe('2026-01-31');
  });

  it('formats month names in pt-BR', () => {
    expect(formatMonthYear('2026-10-15')).toBe('outubro de 2026');
    expect(formatDate('2026-03-05', "d 'de' MMMM")).toBe('5 de março');
  });

  it('accepts Date objects and timestamps', () => {
    const date = new Date('2026-12-25T15:00:00.000Z');
    expect(formatDateTime(date)).toBe('25/12/2026 12:00');
    expect(formatDateTime(date.getTime())).toBe('25/12/2026 12:00');
  });

  it('renders "—" for missing or invalid values', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('not a date')).toBe('—');
    expect(formatDate(new Date(Number.NaN))).toBe('—');
    expect(parseDate('2026-13-45')).toBeNull();
    expect(toISODate(null)).toBeNull();
  });

  it('computes the start of the São Paulo day as an instant', () => {
    expect(startOfDayInAppTimeZone('2026-10-01T20:00:00.000Z')?.toISOString()).toBe(
      '2026-10-01T03:00:00.000Z',
    );
  });

  it('compares calendar days in São Paulo', () => {
    expect(isSameDayInAppTimeZone('2026-10-01T02:59:00Z', '2026-09-30T12:00:00Z')).toBe(true);
    expect(isSameDayInAppTimeZone('2026-10-01T03:00:00Z', '2026-09-30T12:00:00Z')).toBe(false);
  });

  it('labels days for grouped lists', () => {
    const reference = '2026-10-01T15:00:00Z';
    expect(formatDayLabel('2026-10-01T10:00:00Z', reference)).toBe('Hoje');
    expect(formatDayLabel('2026-09-30T23:00:00Z', reference)).toBe('Ontem');
    expect(formatDayLabel('2026-10-01T01:00:00Z', reference)).toBe('Ontem');
    expect(formatDayLabel('2026-09-28T12:00:00Z', reference)).toBe('28/09/2026');
    expect(formatDayLabel(null, reference)).toBe('—');
  });

  describe('with a fixed clock', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-10-01T01:00:00.000Z'));
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('"today" follows São Paulo, not UTC', () => {
      expect(todayISODate()).toBe('2026-09-30');
      expect(formatDayLabel('2026-09-30T12:00:00Z')).toBe('Hoje');
    });

    it('nowInAppTimeZone() exposes São Paulo wall-clock fields', () => {
      const wallClock = nowInAppTimeZone();
      expect(wallClock.getDate()).toBe(30);
      expect(wallClock.getHours()).toBe(22);
    });
  });

  describe('independent of the device time zone', () => {
    const originalTz = process.env.TZ;
    afterEach(() => {
      process.env.TZ = originalTz;
    });

    it.each(['Asia/Tokyo', 'America/Los_Angeles', 'Pacific/Kiritimati'])('TZ=%s', (tz) => {
      process.env.TZ = tz;
      expect(formatDateTime('2026-10-01T02:30:00.000Z')).toBe('30/09/2026 23:30');
      expect(formatDate('2026-10-01')).toBe('01/10/2026');
      expect(toISODate('2026-01-31')).toBe('2026-01-31');
    });
  });
});
