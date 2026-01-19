/**
 * Features-related TypeScript types
 * 
 * Matches the API models from the Caten backend
 */

export interface Feature {
  name: string;
  description: string;
}

export interface FeaturesResponse {
  features: Feature[];
}
