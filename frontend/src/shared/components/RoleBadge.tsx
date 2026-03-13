import type { Skill } from '../models/Skill';
import './RoleBadge.css';

type UserRole = Skill['myRole'];

interface RoleBadgeProps {
  readonly role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const hasNoRole = role === null || role === undefined;
  if (hasNoRole) return null;

  const isOwner = role === 'owner';
  const label = isOwner ? 'Owner' : 'Collaborator';
  const variantClass = isOwner ? 'role-badge--owner' : 'role-badge--collaborator';

  return (
    <span className={`role-badge ${variantClass}`}>{label}</span>
  );
}
