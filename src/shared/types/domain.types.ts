/**
 * Domain-related TypeScript types
 * 
 * Matches the API models from the Caten backend
 */

export type DomainStatus = 'ALLOWED' | 'BANNED';

export interface DomainCreatedByUser {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
}

export interface DomainResponse {
  id: string;
  url: string;
  status: string; // 'ALLOWED' or 'BANNED'
  created_by: DomainCreatedByUser;
  created_at: string; // ISO format timestamp
  updated_at: string; // ISO format timestamp
}

export interface GetAllDomainsResponse {
  domains: DomainResponse[];
  total: number;
  offset: number;
  limit: number;
  has_next: boolean;
}

export interface CreateDomainRequest {
  url: string;
  status?: DomainStatus;
}

export interface UpdateDomainRequest {
  url?: string;
  status?: DomainStatus;
}

