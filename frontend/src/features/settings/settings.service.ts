import { put, del } from '../../shared/services/api.client';
import type { User } from '../../shared/models/User';

export function updateProfile(displayName: string): Promise<User> {
  return put<User>('/me', { displayName });
}

export function deactivateAccount(): Promise<void> {
  return del<void>('/me');
}
