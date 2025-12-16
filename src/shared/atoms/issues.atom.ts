import { atom } from 'jotai';
import type { IssueResponse } from '@/shared/types/issues.types';

export interface IssuesState {
  issues: IssueResponse[];
  isLoading: boolean;
  isLoaded: boolean;
  cachedIssues: Map<string, IssueResponse[]>; // Cache issues by status key
}

const initialIssuesState: IssuesState = {
  issues: [],
  isLoading: false,
  isLoaded: false,
  cachedIssues: new Map(),
};

export const issuesAtom = atom<IssuesState>(initialIssuesState);

