/**
 * Authentication configuration
 * 
 * Contains Google OAuth client ID and CATEN API base URL
 * Can be overridden via environment variables
 */

export const authConfig = {
  /**
   * Google OAuth Client ID
   * Can be overridden via VITE_GOOGLE_CLIENT_ID environment variable
   */
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 
    '355884005048-ad7r1e3hdmkehnq4qvmaa56c2f8gmqpd.apps.googleusercontent.com',
  
  /**
   * CATEN API Base URL
   * Can be overridden via VITE_CATEN_BASE_URL environment variable
   * Default: http://localhost:8000
   */
  catenBaseUrl: import.meta.env.VITE_CATEN_BASE_URL || 'http://localhost:8000',
  
  /**
   * OAuth redirect URI
   * Should match the redirect_uris in Google OAuth config
   */
  redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
} as const;

