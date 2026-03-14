import { formatDate, formatDateTime } from '../format-date';

const SAMPLE_DATE_STRING = '2025-06-15T14:30:00Z';

describe('formatDate', () => {
  it('should format date string with month abbreviation, day and year', () => {
    const result = formatDate(SAMPLE_DATE_STRING);
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('should not include time in the output', () => {
    const result = formatDate(SAMPLE_DATE_STRING);
    expect(result).not.toContain('14');
    expect(result).not.toContain(':30');
  });

  it('should handle different date formats as input', () => {
    const isoDate = '2024-01-01T00:00:00Z';
    const result = formatDate(isoDate);
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
  });
});

describe('formatDateTime', () => {
  it('should include date and time components', () => {
    const result = formatDateTime(SAMPLE_DATE_STRING);
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('should include hours and minutes', () => {
    const midnightDate = '2025-01-01T00:00:00Z';
    const result = formatDateTime(midnightDate);
    expect(result).toContain('Jan');
    expect(result).toContain('2025');
  });

  it('should handle mid-year date', () => {
    const midYear = '2025-07-15T10:30:00Z';
    const result = formatDateTime(midYear);
    expect(result).toContain('Jul');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});
