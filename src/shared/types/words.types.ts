/**
 * Words-related TypeScript types
 * 
 * Matches the API models from the Caten backend
 */

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
}

export interface SavedWord {
  id: string;
  word: string;
  contextualMeaning?: string | null;
  sourceUrl: string;
  folderId: string;
  user: UserInfo;
  createdAt: string;
}

export interface GetSavedWordsResponse {
  words: SavedWord[];
  total: number;
  offset: number;
  limit: number;
}

export interface MyWordsState {
  words: SavedWord[];
  total: number;
  offset: number;
  limit: number;
  isLoading: boolean;
  isLoaded: boolean;
}

