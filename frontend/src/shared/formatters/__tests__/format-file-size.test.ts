import { formatFileSize } from '../format-file-size';

const ONE_KILOBYTE = 1024;
const ONE_MEGABYTE = 1024 * 1024;

describe('formatFileSize', () => {
  it('should format bytes as KB when size is less than 1 MB', () => {
    const fiveHundredKB = 500 * ONE_KILOBYTE;
    const result = formatFileSize(fiveHundredKB);
    expect(result).toBe('500.0 KB');
  });

  it('should format bytes as MB when size is 1 MB or more', () => {
    const twoMB = 2 * ONE_MEGABYTE;
    const result = formatFileSize(twoMB);
    expect(result).toBe('2.0 MB');
  });

  it('should format fractional KB values with one decimal', () => {
    const fractionalKB = 1536;
    const result = formatFileSize(fractionalKB);
    expect(result).toBe('1.5 KB');
  });

  it('should format fractional MB values with one decimal', () => {
    const oneAndHalfMB = 1.5 * ONE_MEGABYTE;
    const result = formatFileSize(oneAndHalfMB);
    expect(result).toBe('1.5 MB');
  });

  it('should format zero bytes as KB', () => {
    const result = formatFileSize(0);
    expect(result).toBe('0.0 KB');
  });

  it('should format exactly 1 MB at the boundary', () => {
    const result = formatFileSize(ONE_MEGABYTE);
    expect(result).toBe('1.0 MB');
  });

  it('should format size just below 1 MB as KB', () => {
    const justBelowOneMB = ONE_MEGABYTE - 1;
    const result = formatFileSize(justBelowOneMB);
    expect(result).toContain('KB');
  });
});
