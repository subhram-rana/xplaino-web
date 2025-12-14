/**
 * Authentication hook
 * 
 * Manages authentication state and provides login/logout functions
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthState, UserInfo } from '@/shared/types/auth.types';
import {
  loginWithGoogle,
  logout as logoutApi,
  saveAuthToStorage,
  getAuthFromStorage,
  clearAuthFromStorage,
} from '@/shared/services/auth.service';

interface UseAuthReturn {
  isLoggedIn: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Custom hook for authentication
 */
export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedAuth = await getAuthFromStorage();
        if (storedAuth) {
          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (storedAuth.accessTokenExpiresAt > now) {
            setAuthState(storedAuth);
          } else {
            // Token expired, clear storage
            await clearAuthFromStorage();
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        await clearAuthFromStorage();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  /**
   * Login with Google ID token
   */
  const login = useCallback(async (idToken: string) => {
    try {
      setIsLoading(true);
      const loginResponse = await loginWithGoogle(idToken);
      await saveAuthToStorage(loginResponse);
      setAuthState(loginResponse);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      if (authState?.accessToken) {
        try {
          await logoutApi(authState.accessToken);
        } catch (error) {
          console.error('Logout API error:', error);
          // Continue with logout even if API call fails
        }
      }
      await clearAuthFromStorage();
      setAuthState(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear storage even on error
      await clearAuthFromStorage();
      setAuthState(null);
    } finally {
      setIsLoading(false);
    }
  }, [authState?.accessToken, navigate]);

  return {
    isLoggedIn: !!authState,
    user: authState?.user || null,
    accessToken: authState?.accessToken || null,
    isLoading,
    login,
    logout,
  };
}

