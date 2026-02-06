/**
 * Custom hook for managing issues state
 * 
 * Uses AbortController to cancel in-flight requests when a new fetch starts,
 * preventing race conditions between concurrent fetches (e.g. refresh button
 * clicks, token refresh re-renders, React StrictMode double-mounts).
 */

import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { issuesAtom } from '@/shared/atoms/issues.atom';
import { getMyIssues } from '@/shared/services/issues.service';
import type { IssuesState } from '@/shared/atoms/issues.atom';

export interface UseMyIssuesReturn {
  state: IssuesState;
  fetchIssues: (accessToken: string, statuses?: string[]) => Promise<void>;
  resetIssues: () => void;
}

export function useMyIssues(): UseMyIssuesReturn {
  const [state, setState] = useAtom(issuesAtom);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep a ref to the latest state so fetchIssues can read the cache
  // without including state.cachedIssues as a useCallback dependency
  // (which would make fetchIssues referentially unstable and re-trigger effects).
  const stateRef = useRef(state);
  stateRef.current = state;

  const fetchIssues = useCallback(
    async (accessToken: string, statuses?: string[]) => {
      // Create cache key from statuses
      const cacheKey = statuses && statuses.length > 0 ? [...statuses].sort().join(',') : 'ALL';

      // Check cache via ref (always reads the latest atom value)
      const cached = stateRef.current.cachedIssues.get(cacheKey);
      if (cached !== undefined) {
        setState((prev) => ({
          ...prev,
          issues: cached,
          isLoaded: true,
        }));
        return;
      }

      // Abort any previous in-flight request before starting a new one
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Set loading state
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await getMyIssues(accessToken, statuses, controller.signal);

        // Only update state if this request was not aborted
        if (!controller.signal.aborted) {
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
        }
      } catch (error) {
        // Silently ignore AbortError — a new request is replacing this one
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching issues:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [setState]
  );

  const resetIssues = useCallback(() => {
    // Cancel any in-flight request before resetting state
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState({
      issues: [],
      isLoading: false,
      isLoaded: false,
      cachedIssues: new Map(),
    });
  }, [setState]);

  // Abort in-flight request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    state,
    fetchIssues,
    resetIssues,
  };
}

