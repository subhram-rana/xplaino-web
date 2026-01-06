/**
 * Links-related TypeScript types
 * 
 * Matches the API models from the Caten backend
 */

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SavedLink {
  id: string;
  name: string | null;
  url: string;
  type: string;
  summary: string | null;
  metadata: Record<string, any> | null;
  folder_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface GetAllSavedLinksResponse {
  folder_id: string | null;
  user_id: string;
  sub_folders: Folder[];
  saved_links: SavedLink[];
  total: number;
  offset: number;
  limit: number;
  has_next: boolean;
}



