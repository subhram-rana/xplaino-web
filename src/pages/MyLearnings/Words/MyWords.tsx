import React, { useEffect, useState } from 'react';
import { FiCopy, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import styles from './MyWords.module.css';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoginModal } from '@/shared/components/LoginModal';
import { useMyWords } from '@/shared/hooks/useMyWords';
import { ChromeButton } from '@/shared/components/ChromeButton';

/**
 * MyWords - My Words page component
 * 
 * @returns JSX element
 */
export const MyWords: React.FC = () => {
  const { isLoggedIn, accessToken } = useAuth();
  const { state, fetchWords, deleteWord } = useMyWords();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && accessToken && !state.isLoaded && !state.isLoading) {
      fetchWords(0, 20, accessToken).catch((error) => {
        console.error('Error fetching words:', error);
      });
    }
  }, [isLoggedIn, accessToken, state.isLoaded, state.isLoading, fetchWords]);

  // Refetch if offset changed and we need new data
  useEffect(() => {
    if (isLoggedIn && accessToken && state.isLoaded && !state.isLoading) {
      // Check if we need to refetch due to pagination change
      const needsRefetch = state.words.length === 0 && state.offset > 0 && state.total > 0;
      if (needsRefetch) {
        fetchWords(state.offset, state.limit, accessToken).catch((error) => {
          console.error('Error fetching words:', error);
        });
      }
    }
  }, [state.offset, isLoggedIn, accessToken, state.isLoaded, state.isLoading, state.words.length, state.total, fetchWords]);

  const handleCopy = async (word: string) => {
    try {
      await navigator.clipboard.writeText(word);
    } catch (error) {
      console.error('Failed to copy word:', error);
    }
  };

  const handleDelete = async (wordId: string) => {
    if (!accessToken) return;

    try {
      setDeletingId(wordId);
      await deleteWord(wordId, accessToken);
      // If we deleted and need to refetch, it will be handled by the hook
      if (state.words.length === 0 && state.offset > 0) {
        await fetchWords(state.offset, state.limit, accessToken);
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      // Error is already handled by the hook (reverts optimistic update)
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrevious = () => {
    if (state.offset > 0 && accessToken) {
      const newOffset = Math.max(0, state.offset - state.limit);
      fetchWords(newOffset, state.limit, accessToken).catch((error) => {
        console.error('Error fetching words:', error);
      });
    }
  };

  const handleNext = () => {
    if (state.offset + state.limit < state.total && accessToken) {
      const newOffset = state.offset + state.limit;
      fetchWords(newOffset, state.limit, accessToken).catch((error) => {
        console.error('Error fetching words:', error);
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.myWords}>
        <LoginModal actionText="view your saved words" />
      </div>
    );
  }

  const startIndex = state.offset + 1;
  const endIndex = Math.min(state.offset + state.limit, state.total);
  const canGoPrevious = state.offset > 0;
  const canGoNext = state.offset + state.limit < state.total;

  return (
    <div className={styles.myWords}>
      <div className={styles.container}>
        {state.isLoading && state.words.length === 0 ? (
          <div className={styles.loading}>Loading...</div>
        ) : state.words.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyHeading}>No saved words yet</h2>
            <p className={styles.emptyMessage}>
              Start gathering important words, meanings and the source webpages
            </p>
            <div className={styles.chromeButtonContainer}>
              <ChromeButton />
            </div>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Meaning</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.words.map((word) => (
                    <tr key={word.id}>
                      <td>
                        <div className={styles.wordCell}>
                          <button
                            className={styles.copyButton}
                            onClick={() => handleCopy(word.word)}
                            aria-label={`Copy ${word.word}`}
                            title="Copy word"
                          >
                            <FiCopy />
                          </button>
                          <span className={styles.wordText}>{word.word}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.meaningCell}>
                          {word.contextual_meaning || 'No meaning available'}
                        </div>
                      </td>
                      <td>
                        <a
                          href={word.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.sourceLink}
                          aria-label={`Open source in new tab`}
                        >
                          <FiExternalLink />
                        </a>
                      </td>
                      <td>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(word.id)}
                          disabled={deletingId === word.id}
                          aria-label={`Delete ${word.word}`}
                          title="Delete word"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {state.total > 0 && (
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Showing {startIndex}-{endIndex} of {state.total}
                </div>
                <div className={styles.paginationControls}>
                  <button
                    className={styles.paginationButton}
                    onClick={handlePrevious}
                    disabled={!canGoPrevious || state.isLoading}
                  >
                    Previous
                  </button>
                  <button
                    className={styles.paginationButton}
                    onClick={handleNext}
                    disabled={!canGoNext || state.isLoading}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

MyWords.displayName = 'MyWords';

