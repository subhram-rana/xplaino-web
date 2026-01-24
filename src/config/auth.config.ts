/**
 * Authentication configuration
 * 
 * Contains Google OAuth client ID and CATEN API base URL.
 * Values are loaded from environment variables (OS env or .env files).
 * 
 * Priority: OS env vars > .env.local > .env.[mode] > .env
 */

/**
 * Get a required environment variable with validation
 * Logs an error if the variable is missing (but doesn't throw to avoid breaking the app)
 */
function getRequiredEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    console.error(`Missing required environment variable: ${key}. Check your .env.local file.`);
  }
  return value || '';
}

export const authConfig = {
  /**
   * Google OAuth Client ID
   * Required - must be set in .env.local
   */
  googleClientId: getRequiredEnv('VITE_GOOGLE_CLIENT_ID'),
  
  /**
   * CATEN API Base URL
   * Default: http://localhost:8000
   */
  catenBaseUrl: import.meta.env.VITE_CATEN_BASE_URL || 'http://localhost:8000',
  
  /**
   * OAuth redirect URI
   * Default: window.location.origin
   */
  redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
} as const;

