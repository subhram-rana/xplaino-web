/**
 * Authentication hook
 *
 * Thin wrapper around the AuthContext. Components should use this
 * hook to access authentication state and actions.
 */
import type { UserInfo } from '@/shared/types/auth.types';
import { useAuthContext } from './AuthContext';

export interface UseAuthReturn {
  isLoggedIn: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  return useAuthContext();
}


