import type { ReactNode } from 'react';
import { CountBadge } from './CountBadge';
import type { CountBadgeVariant } from './CountBadge';
import './SectionHeader.css';

interface SectionHeaderProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly count?: number;
  readonly badgeVariant?: CountBadgeVariant;
}

export function SectionHeader({
  icon,
  title,
  count = 0,
  badgeVariant = 'warning',
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header-title">
        {icon}
        <span>{title}</span>
        <CountBadge count={count} variant={badgeVariant} />
      </div>
    </div>
  );
}
