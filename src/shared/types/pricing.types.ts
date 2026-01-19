/**
 * Pricing-related TypeScript types
 * 
 * Matches the API models from the Caten backend
 */

export interface CreatedByUser {
  id: string;
  name: string;
  role: string | null;
  profileIconUrl?: string | null;
}

export enum PricingStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED"
}

export enum Currency {
  USD = "USD"
}

export enum MaxAllowedType {
  FIXED = "FIXED",
  UNLIMITED = "UNLIMITED"
}

export interface PricingFeature {
  name: string;
  is_allowed: boolean;
  max_allowed_type: MaxAllowedType | null;
  max_allowed_count: number | null;
  description?: string; // Added by backend enrichment
}

export interface Discount {
  discount_percentage: number;
  discount_valid_till: string;
}

export interface PricingDetails {
  monthly_price: number;
  monthly_discount: Discount;
  is_yearly_enabled: boolean;
  yearly_discount: Discount | null;
}

export interface PricingResponse {
  id: string;
  name: string;
  activation: string; // ISO format timestamp
  expiry: string; // ISO format timestamp
  status: string; // 'ENABLED' or 'DISABLED'
  features: PricingFeature[];
  currency: string; // 'USD'
  pricing_details: PricingDetails;
  description: string; // Pricing plan description
  is_highlighted: boolean | null; // Whether this pricing plan is highlighted
  created_by: CreatedByUser;
  created_at: string; // ISO format timestamp
  updated_at: string; // ISO format timestamp
}

export interface GetLivePricingsResponse {
  pricings: PricingResponse[];
}

export interface GetAllPricingsResponse {
  pricings: PricingResponse[];
}

export interface CreatePricingRequest {
  name: string;
  activation: string; // ISO format timestamp
  expiry: string; // ISO format timestamp
  status: PricingStatus;
  features: PricingFeature[];
  currency: Currency;
  pricing_details: PricingDetails;
  description: string; // Required: max 500 characters
  is_highlighted?: boolean; // Optional: whether this pricing plan is highlighted
}

export interface UpdatePricingRequest {
  name?: string;
  activation?: string; // ISO format timestamp
  expiry?: string; // ISO format timestamp
  status?: PricingStatus;
  features?: PricingFeature[];
  currency?: Currency;
  pricing_details?: PricingDetails;
  description?: string; // Optional: max 500 characters
  is_highlighted?: boolean; // Optional: whether this pricing plan is highlighted
}
