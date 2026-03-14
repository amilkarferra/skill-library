import { formatRelativeDate } from '../format-relative-date';

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;
const SECONDS_PER_MONTH = 2592000;

function buildDateStringSecondsAgo(secondsAgo: number): string {
  const pastTimestamp = Date.now() - secondsAgo * MILLISECONDS_PER_SECOND;
  return new Date(pastTimestamp).toISOString();
}

describe('formatRelativeDate', () => {
  it('should return "just now" for dates less than 1 minute ago', () => {
    const tenSecondsAgo = buildDateStringSecondsAgo(10);
    const result = formatRelativeDate(tenSecondsAgo);
    expect(result).toBe('just now');
  });

  it('should return minutes ago for dates less than 1 hour ago', () => {
    const fiveMinutesAgo = buildDateStringSecondsAgo(5 * SECONDS_PER_MINUTE);
    const result = formatRelativeDate(fiveMinutesAgo);
    expect(result).toBe('5m ago');
  });

  it('should return hours ago for dates less than 1 day ago', () => {
    const threeHoursAgo = buildDateStringSecondsAgo(3 * SECONDS_PER_HOUR);
    const result = formatRelativeDate(threeHoursAgo);
    expect(result).toBe('3h ago');
  });

  it('should return days ago for dates less than 1 week ago', () => {
    const twoDaysAgo = buildDateStringSecondsAgo(2 * SECONDS_PER_DAY);
    const result = formatRelativeDate(twoDaysAgo);
    expect(result).toBe('2d ago');
  });

  it('should return weeks ago for dates less than 1 month ago', () => {
    const twoWeeksAgo = buildDateStringSecondsAgo(2 * SECONDS_PER_WEEK);
    const result = formatRelativeDate(twoWeeksAgo);
    expect(result).toBe('2w ago');
  });

  it('should return formatted date for dates older than 1 month', () => {
    const twoMonthsAgo = buildDateStringSecondsAgo(2 * SECONDS_PER_MONTH);
    const result = formatRelativeDate(twoMonthsAgo);
    expect(result).toContain('202');
  });

  it('should return "1m ago" at exactly 1 minute', () => {
    const exactlyOneMinute = buildDateStringSecondsAgo(SECONDS_PER_MINUTE);
    const result = formatRelativeDate(exactlyOneMinute);
    expect(result).toBe('1m ago');
  });

  it('should return "1h ago" at exactly 1 hour', () => {
    const exactlyOneHour = buildDateStringSecondsAgo(SECONDS_PER_HOUR);
    const result = formatRelativeDate(exactlyOneHour);
    expect(result).toBe('1h ago');
  });

  it('should return "1d ago" at exactly 1 day', () => {
    const exactlyOneDay = buildDateStringSecondsAgo(SECONDS_PER_DAY);
    const result = formatRelativeDate(exactlyOneDay);
    expect(result).toBe('1d ago');
  });

  it('should return "1w ago" at exactly 1 week', () => {
    const exactlyOneWeek = buildDateStringSecondsAgo(SECONDS_PER_WEEK);
    const result = formatRelativeDate(exactlyOneWeek);
    expect(result).toBe('1w ago');
  });
});
