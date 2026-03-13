import './CountBadge.css';

export type CountBadgeVariant = 'default' | 'warning';

interface CountBadgeProps {
  readonly count: number;
  readonly variant?: CountBadgeVariant;
}

export function CountBadge({ count, variant = 'default' }: CountBadgeProps) {
  const isZero = count === 0;
  if (isZero) return null;

  const badgeClassName = buildBadgeClassName(variant);

  return <span className={badgeClassName}>{count}</span>;
}

function buildBadgeClassName(variant: CountBadgeVariant): string {
  const base = 'count-badge';
  const isWarning = variant === 'warning';
  return isWarning ? `${base} ${base}--warning` : base;
}
