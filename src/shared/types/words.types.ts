/**
 * Words-related TypeScript types
 * 
 * Matches the API models from the Caten backend
 */

export interface SavedWord {
  id: string;
  word: string;
  sourceUrl: string;
  userId: string;
  createdAt: string;
  contextual_meaning?: string;
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

