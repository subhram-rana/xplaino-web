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
  
  // Price IDs organized by billing period
  priceIds: {
    monthly: {
      pro: import.meta.env.VITE_PADDLE_PRICE_PRO_MONTHLY || '',
      ultra: import.meta.env.VITE_PADDLE_PRICE_ULTRA_MONTHLY || '',
    },
    yearly: {
      pro: import.meta.env.VITE_PADDLE_PRICE_PRO_YEARLY || '',
      ultra: import.meta.env.VITE_PADDLE_PRICE_ULTRA_YEARLY || '',
    },
  },
  
  // Discount IDs for each price (each discount is restricted to its specific price)
  discountIds: {
    monthly: {
      pro: import.meta.env.VITE_PADDLE_DISCOUNT_PRO_MONTHLY || '',
      ultra: import.meta.env.VITE_PADDLE_DISCOUNT_ULTRA_MONTHLY || '',
    },
    yearly: {
      pro: import.meta.env.VITE_PADDLE_DISCOUNT_PRO_YEARLY || '',
      ultra: import.meta.env.VITE_PADDLE_DISCOUNT_ULTRA_YEARLY || '',
    },
  },
} as const;

export type PaddleEnvironment = typeof paddleConfig.environment;
export type BillingPeriod = 'monthly' | 'yearly';
export type PlanType = 'pro' | 'ultra';
