import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './Login.module.css';

/**
 * Login - Login page component
 * 
 * @returns JSX element
 */
export const Login: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      await login(credentialResponse.credential);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <div className={styles.login}>
      <div className={styles.content}>
        <div className={styles.loginContainer}>
          <h1 className={styles.heading}>Login</h1>
          <div className={styles.googleButtonWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
            />
          </div>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          {isLoading && (
            <div className={styles.loadingMessage}>
              Signing in...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Login.displayName = 'Login';

