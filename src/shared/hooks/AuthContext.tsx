import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthState, UserInfo } from '@/shared/types/auth.types';
import {
  loginWithGoogle,
  logout as logoutApi,
  saveAuthToStorage,
  getAuthFromStorage,
  clearAuthFromStorage,
} from '@/shared/services/auth.service';

interface AuthContextValue {
  isLoggedIn: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedAuth = await getAuthFromStorage();
        if (storedAuth) {
          const now = Math.floor(Date.now() / 1000);
          if (storedAuth.accessTokenExpiresAt > now) {
            setAuthState(storedAuth);
          } else {
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

  const login = useCallback(
    async (idToken: string) => {
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
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      if (authState?.accessToken) {
        try {
          await logoutApi(authState.accessToken);
        } catch (error) {
          console.error('Logout API error:', error);
        }
      }
      await clearAuthFromStorage();
      setAuthState(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      await clearAuthFromStorage();
      setAuthState(null);
    } finally {
      setIsLoading(false);
    }
  }, [authState?.accessToken, navigate]);

  const value: AuthContextValue = {
    isLoggedIn: !!authState,
    user: authState?.user || null,
    accessToken: authState?.accessToken || null,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}


