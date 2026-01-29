/**
 * Paddle Configuration
 * 
 * Configuration for Paddle.js integration including
 * client token, environment, and price IDs.
 */

export const paddleConfig = {
  // Client-side token from Paddle dashboard
  // Get this from: Paddle > Developer Tools > Authentication > Client-side tokens
  clientToken: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '',
  
  // Environment: 'sandbox' for testing, 'production' for live
  environment: (import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  
  // Price IDs from your Paddle catalog
  // These are fetched dynamically, but you can define known IDs here for reference
  priceIds: {
    pro: 'pri_01kfx4f260av038gdqft568z2d',      // $30/month
    ultra: 'pri_01kfx4hw8gpfzbe09w82m54ekk',    // $40/month
  },
} as const;

export type PaddleEnvironment = typeof paddleConfig.environment;
