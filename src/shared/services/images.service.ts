/**
 * Images service
 * 
 * Handles API calls for saved images operations
 */

import { authConfig } from '@/config/auth.config';
import type { GetAllSavedImagesResponse } from '@/shared/types/images.types';

/**
 * Get all saved images by folder ID with pagination
 */
export async function getAllSavedImagesByFolderId(
  accessToken: string,
  folderId: string,
  offset: number = 0,
  limit: number = 20
): Promise<GetAllSavedImagesResponse> {
  const response = await fetch(
    `${authConfig.catenBaseUrl}/api/saved-image?folder-id=${folderId}&offset=${offset}&limit=${limit}`,
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
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch saved images' }));
    throw new Error(errorData.detail || `Failed to fetch saved images with status ${response.status}`);
  }

  const data: GetAllSavedImagesResponse = await response.json();
  return data;
}

