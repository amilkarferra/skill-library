import './UserInitials.css';

interface UserInitialsProps {
  readonly displayName: string;
  readonly size?: 'small' | 'medium';
}

function extractInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  const hasMultipleWords = words.length > 1;
  if (hasMultipleWords) {
    return `${words[0][0]}${words[1][0]}`;
  }
  return displayName.slice(0, 2);
}

export function UserInitials({
  displayName,
  size = 'medium',
}: UserInitialsProps) {
  const initials = extractInitials(displayName);
  const className = `user-initials user-initials--${size}`;

  return (
    <span className={className}>{initials}</span>
  );
}
