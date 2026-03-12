const BYTES_PER_KILOBYTE = 1024;
const BYTES_PER_MEGABYTE = 1024 * 1024;

export function formatFileSize(sizeInBytes: number): string {
  const isKilobytes = sizeInBytes < BYTES_PER_MEGABYTE;
  if (isKilobytes) {
    return `${(sizeInBytes / BYTES_PER_KILOBYTE).toFixed(1)} KB`;
  }
  return `${(sizeInBytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`;
}
