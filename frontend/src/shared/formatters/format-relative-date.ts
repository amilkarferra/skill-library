const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;
const SECONDS_PER_MONTH = 2592000;

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const elapsedSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const isLessThanOneMinute = elapsedSeconds < SECONDS_PER_MINUTE;
  if (isLessThanOneMinute) return 'just now';

  const isLessThanOneHour = elapsedSeconds < SECONDS_PER_HOUR;
  if (isLessThanOneHour) {
    const minutes = Math.floor(elapsedSeconds / SECONDS_PER_MINUTE);
    return `${minutes}m ago`;
  }

  const isLessThanOneDay = elapsedSeconds < SECONDS_PER_DAY;
  if (isLessThanOneDay) {
    const hours = Math.floor(elapsedSeconds / SECONDS_PER_HOUR);
    return `${hours}h ago`;
  }

  const isLessThanOneWeek = elapsedSeconds < SECONDS_PER_WEEK;
  if (isLessThanOneWeek) {
    const days = Math.floor(elapsedSeconds / SECONDS_PER_DAY);
    return `${days}d ago`;
  }

  const isLessThanOneMonth = elapsedSeconds < SECONDS_PER_MONTH;
  if (isLessThanOneMonth) {
    const weeks = Math.floor(elapsedSeconds / SECONDS_PER_WEEK);
    return `${weeks}w ago`;
  }

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
