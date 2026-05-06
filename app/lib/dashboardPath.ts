import type { AppUser } from '../context/AuthContext';

export function dashboardPathForUser(user: AppUser | null | undefined): string {
  if (!user?.userType) return '/welcome';
  return user.userType === 'buyer' ? '/dashboard/buyer' : '/dashboard/farmer';
}

