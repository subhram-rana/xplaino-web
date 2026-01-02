/**
 * Images-related TypeScript types
 * 
 * Matches the API models from the Caten backend
 */

export interface SavedImageCreatedByUser {
  id: string;
  email: string;
  name: string;
}

export interface SavedImage {
  id: string;
  sourceUrl: string;
  imageUrl: string;
  name: string | null;
  folderId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: SavedImageCreatedByUser;
}

export interface GetAllSavedImagesResponse {
  images: SavedImage[];
  total: number;
  offset: number;
  limit: number;
  has_next: boolean;
}

