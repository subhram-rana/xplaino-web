/**
 * Custom hook for managing my words state
 */

import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { myWordsAtom } from '@/shared/atoms/words.atom';
import { getSavedWords, deleteSavedWord } from '@/shared/services/words.service';
import type { MyWordsState } from '@/shared/types/words.types';

export interface UseMyWordsReturn {
  state: MyWordsState;
  fetchWords: (offset: number, limit: number, accessToken: string) => Promise<void>;
  deleteWord: (wordId: string, accessToken: string) => Promise<void>;
  resetWords: () => void;
}

export function useMyWords(): UseMyWordsReturn {
  const [state, setState] = useAtom(myWordsAtom);

  const fetchWords = useCallback(
    async (offset: number, limit: number, accessToken: string) => {
      // Only fetch if not already loaded or if pagination changed
      if (state.isLoaded && state.offset === offset && state.limit === limit) {
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await getSavedWords(accessToken, offset, limit);
        setState({
          words: response.words,
          total: response.total,
          offset: response.offset,
          limit: response.limit,
          isLoading: false,
          isLoaded: true,
        });
      } catch (error) {
        console.error('Error fetching words:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [state.isLoaded, state.offset, state.limit, setState]
  );

  const deleteWord = useCallback(
    async (wordId: string, accessToken: string) => {
      // Optimistically remove word from state
      setState((prev) => ({
        ...prev,
        words: prev.words.filter((word) => word.id !== wordId),
        total: Math.max(0, prev.total - 1),
      }));

      try {
        await deleteSavedWord(accessToken, wordId);
        // If we're on the last page and it becomes empty, go to previous page
        setState((prev) => {
          const currentPageStart = prev.offset;
          const currentPageEnd = prev.offset + prev.limit;
          const remainingWords = prev.words.length;

          // If current page is empty and we're not on the first page, go to previous page
          if (remainingWords === 0 && prev.offset > 0) {
            const newOffset = Math.max(0, prev.offset - prev.limit);
            // Trigger refetch by resetting isLoaded
            return {
              ...prev,
              offset: newOffset,
              isLoaded: false,
            };
          }

          return prev;
        });
      } catch (error) {
        console.error('Error deleting word:', error);
        // Revert optimistic update by refetching
        setState((prev) => ({
          ...prev,
          isLoaded: false,
        }));
        throw error;
      }
    },
    [setState]
  );

  const resetWords = useCallback(() => {
    setState({
      words: [],
      total: 0,
      offset: 0,
      limit: 20,
      isLoading: false,
      isLoaded: false,
    });
  }, [setState]);

  return {
    state,
    fetchWords,
    deleteWord,
    resetWords,
  };
}

