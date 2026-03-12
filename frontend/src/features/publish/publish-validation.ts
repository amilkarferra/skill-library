const MAX_FILE_SIZE_BYTES = 52_428_800;
const ACCEPTED_EXTENSIONS = ['.skill', '.md', '.zip'];

export function validateFileExtension(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export function validateFileSize(fileSize: number): boolean {
  return fileSize <= MAX_FILE_SIZE_BYTES;
}

export function buildFileValidationError(file: File): string | null {
  const hasValidExtension = validateFileExtension(file.name);
  if (!hasValidExtension) {
    return 'Invalid file type. Only .skill, .zip and .md files are accepted.';
  }

  const hasValidSize = validateFileSize(file.size);
  if (!hasValidSize) {
    return 'File exceeds 50MB limit.';
  }

  return null;
}
