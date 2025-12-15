/**
 * Jotai atoms for words state management
 */

import { atom } from 'jotai';
import type { MyWordsState } from '@/shared/types/words.types';

const initialMyWordsState: MyWordsState = {
  words: [],
  total: 0,
  offset: 0,
  limit: 20,
  isLoading: false,
  isLoaded: false,
};

export const myWordsAtom = atom<MyWordsState>(initialMyWordsState);

