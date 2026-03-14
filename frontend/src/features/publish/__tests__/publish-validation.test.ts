import {
  validateFileExtension,
  validateFileSize,
  buildFileValidationError,
} from '../publish-validation';

const MAX_FILE_SIZE_BYTES = 52_428_800;
const ONE_MEGABYTE = 1024 * 1024;

describe('validateFileExtension', () => {
  it('should accept .skill files', () => {
    const result = validateFileExtension('my-skill.skill');
    expect(result).toBe(true);
  });

  it('should accept .md files', () => {
    const result = validateFileExtension('readme.md');
    expect(result).toBe(true);
  });

  it('should accept .zip files', () => {
    const result = validateFileExtension('archive.zip');
    expect(result).toBe(true);
  });

  it('should accept uppercase extensions', () => {
    const result = validateFileExtension('file.SKILL');
    expect(result).toBe(true);
  });

  it('should accept mixed case extensions', () => {
    const result = validateFileExtension('file.Zip');
    expect(result).toBe(true);
  });

  it('should reject .txt files', () => {
    const result = validateFileExtension('file.txt');
    expect(result).toBe(false);
  });

  it('should reject .exe files', () => {
    const result = validateFileExtension('malware.exe');
    expect(result).toBe(false);
  });

  it('should reject files without extension', () => {
    const result = validateFileExtension('noextension');
    expect(result).toBe(false);
  });

  it('should reject .json files', () => {
    const result = validateFileExtension('config.json');
    expect(result).toBe(false);
  });
});

describe('validateFileSize', () => {
  it('should accept files at exactly the limit', () => {
    const result = validateFileSize(MAX_FILE_SIZE_BYTES);
    expect(result).toBe(true);
  });

  it('should accept files below the limit', () => {
    const tenMB = 10 * ONE_MEGABYTE;
    const result = validateFileSize(tenMB);
    expect(result).toBe(true);
  });

  it('should reject files above the limit', () => {
    const overLimit = MAX_FILE_SIZE_BYTES + 1;
    const result = validateFileSize(overLimit);
    expect(result).toBe(false);
  });

  it('should accept zero-byte files', () => {
    const result = validateFileSize(0);
    expect(result).toBe(true);
  });
});

describe('buildFileValidationError', () => {
  it('should return null for valid file', () => {
    const validFile = { name: 'skill.zip', size: ONE_MEGABYTE } as File;
    const result = buildFileValidationError(validFile);
    expect(result).toBeNull();
  });

  it('should return extension error for invalid type', () => {
    const invalidTypeFile = { name: 'file.txt', size: ONE_MEGABYTE } as File;
    const result = buildFileValidationError(invalidTypeFile);
    expect(result).toContain('Invalid file type');
  });

  it('should return size error for oversized file with valid extension', () => {
    const oversizedFile = {
      name: 'large.zip',
      size: MAX_FILE_SIZE_BYTES + 1,
    } as File;
    const result = buildFileValidationError(oversizedFile);
    expect(result).toContain('50MB');
  });

  it('should prioritize extension error over size error', () => {
    const invalidBothFile = {
      name: 'file.exe',
      size: MAX_FILE_SIZE_BYTES + 1,
    } as File;
    const result = buildFileValidationError(invalidBothFile);
    expect(result).toContain('Invalid file type');
  });

  it('should return null for .md file under limit', () => {
    const mdFile = { name: 'readme.md', size: 1024 } as File;
    const result = buildFileValidationError(mdFile);
    expect(result).toBeNull();
  });

  it('should return null for .skill file under limit', () => {
    const skillFile = { name: 'my.skill', size: 2048 } as File;
    const result = buildFileValidationError(skillFile);
    expect(result).toBeNull();
  });
});
