/**
 * Custom hook for managing issues state
 */

import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { issuesAtom } from '@/shared/atoms/issues.atom';
import { getMyIssues } from '@/shared/services/issues.service';
import type { IssuesState } from '@/shared/atoms/issues.atom';
import type { IssueResponse } from '@/shared/types/issues.types';

export interface UseMyIssuesReturn {
  state: IssuesState;
  fetchIssues: (accessToken: string, statuses?: string[]) => Promise<void>;
  resetIssues: () => void;
}

export function useMyIssues(): UseMyIssuesReturn {
  const [state, setState] = useAtom(issuesAtom);

  const fetchIssues = useCallback(
    async (accessToken: string, statuses?: string[]) => {
      // Create cache key from statuses
      const cacheKey = statuses && statuses.length > 0 ? statuses.sort().join(',') : 'ALL';
      
      let cachedData: IssueResponse[] | undefined;
      let needsFetch = false;
      
      setState((prev) => {
        // Check if already loading
        if (prev.isLoading) {
          return prev;
        }
        
        // Check if issues are already cached
        const cached = prev.cachedIssues.get(cacheKey);
        if (cached !== undefined) {
          cachedData = cached;
          return {
            ...prev,
            issues: cached,
            isLoaded: true,
          };
        }
        
        needsFetch = true;
        return { ...prev, isLoading: true };
      });

      // If we found cached data, return early (no API call needed)
      if (cachedData !== undefined) {
        return;
      }

      // Only fetch if not cached
      if (!needsFetch) {
        return;
      }

      try {
        const response = await getMyIssues(accessToken, statuses);
        setState((prev) => {
          const newCache = new Map(prev.cachedIssues);
          newCache.set(cacheKey, response.issues);
          
          return {
            issues: response.issues,
            isLoading: false,
            isLoaded: true,
            cachedIssues: newCache,
          };
        });
      } catch (error) {
        console.error('Error fetching issues:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [setState]
  );

  const resetIssues = useCallback(() => {
    setState({
      issues: [],
      isLoading: false,
      isLoaded: false,
      cachedIssues: new Map(),
    });
  }, [setState]);

  return {
    state,
    fetchIssues,
    resetIssues,
  };
}

