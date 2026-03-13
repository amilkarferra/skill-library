import type { ReactNode } from 'react';
import './StatCard.css';

interface StatCardProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly formattedValue: string;
}

export function StatCard({ icon, label, formattedValue }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-text">
        <span className="stat-card-value">{formattedValue}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  );
}
