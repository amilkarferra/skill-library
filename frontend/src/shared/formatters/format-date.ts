const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', DATE_TIME_FORMAT_OPTIONS);
}
