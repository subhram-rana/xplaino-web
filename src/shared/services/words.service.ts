/**
 * Words service
 * 
 * Handles API calls for saved words operations
 */

import { authConfig } from '@/config/auth.config';
import type { GetSavedWordsResponse } from '@/shared/types/words.types';

/**
 * Get saved words with pagination
 */
export async function getSavedWords(
  accessToken: string,
  offset: number = 0,
  limit: number = 20
): Promise<GetSavedWordsResponse> {
  const response = await fetch(
    `${authConfig.catenBaseUrl}/api/saved-words/?offset=${offset}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Source': 'XPLAINO_WEB',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch saved words' }));
    throw new Error(errorData.detail || `Failed to fetch saved words with status ${response.status}`);
  }

  const data: GetSavedWordsResponse = await response.json();
  return data;
}

/**
 * Delete a saved word by ID
 */
export async function deleteSavedWord(
  accessToken: string,
  wordId: string
): Promise<void> {
  const response = await fetch(
    `${authConfig.catenBaseUrl}/api/saved-words/${wordId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Source': 'XPLAINO_WEB',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to delete saved word' }));
    throw new Error(errorData.detail || `Failed to delete saved word with status ${response.status}`);
  }
}

