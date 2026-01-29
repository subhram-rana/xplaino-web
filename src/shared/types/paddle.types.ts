/**
 * Paddle TypeScript Types
 * 
 * Type definitions for Paddle API responses and data structures
 */

/**
 * Paddle billing cycle information
 */
export interface PaddleBillingCycle {
  interval: 'day' | 'week' | 'month' | 'year';
  frequency: number;
}

/**
 * Paddle unit price information
 */
export interface PaddleUnitPrice {
  amount: string; // Amount in smallest currency unit (cents)
  currencyCode: string; // e.g., 'USD'
}

/**
 * Paddle product information
 */
export interface PaddleProduct {
  id: string;
  name: string;
  description: string | null;
  type: 'standard' | 'custom';
  taxCategory: string;
  imageUrl: string | null;
  customData: Record<string, unknown> | null;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

/**
 * Paddle price information (from list_prices API)
 */
export interface PaddlePrice {
  id: string;
  productId: string;
  name: string | null;
  description: string | null;
  type: 'standard' | 'custom';
  billingCycle: PaddleBillingCycle | null;
  trialPeriod: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  } | null;
  taxMode: 'account_setting' | 'external' | 'internal';
  unitPrice: PaddleUnitPrice;
  unitPriceOverrides: Array<{
    countryCodes: string[];
    unitPrice: PaddleUnitPrice;
  }>;
  quantity: {
    minimum: number;
    maximum: number;
  };
  status: 'active' | 'archived';
  customData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  product?: PaddleProduct;
}

/**
 * Price preview item for Paddle.PricePreview()
 */
export interface PaddlePricePreviewItem {
  priceId: string;
  quantity: number;
}

/**
 * Formatted price data for UI display
 * Uses Paddle's pre-formatted prices which include localized currency symbols
 */
export interface FormattedPaddlePrice {
  id: string;
  name: string;
  description: string;
  amount: number; // Converted from smallest currency unit to main unit
  currencyCode: string;
  currencySymbol: string;
  billingInterval: string;
  billingFrequency: number;
  formattedPrice: string; // Pre-formatted by Paddle, e.g., "₹2,335.26" or "$30.00"
  formattedBillingCycle: string; // e.g., "per month"
  product: {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
  } | null;
}

/**
 * Checkout item for Paddle.Checkout.open()
 */
export interface PaddleCheckoutItem {
  priceId: string;
  quantity?: number;
}

/**
 * Checkout settings for Paddle.Checkout.open()
 */
export interface PaddleCheckoutSettings {
  displayMode?: 'overlay' | 'inline';
  theme?: 'light' | 'dark';
  locale?: string;
  allowLogout?: boolean;
  showAddDiscounts?: boolean;
  showAddTaxId?: boolean;
  successUrl?: string;
}

/**
 * Customer information for checkout
 */
export interface PaddleCheckoutCustomer {
  email?: string;
  address?: {
    countryCode: string;
    postalCode?: string;
  };
}
