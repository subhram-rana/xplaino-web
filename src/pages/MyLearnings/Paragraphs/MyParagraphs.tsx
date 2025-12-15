import React from 'react';
import styles from './MyParagraphs.module.css';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoginModal } from '@/shared/components/LoginModal';

/**
 * MyParagraphs - My Paragraphs page component
 * 
 * @returns JSX element
 */
export const MyParagraphs: React.FC = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className={styles.myParagraphs}>
        <LoginModal actionText="view your saved paragraphs" />
      </div>
    );
  }

  return (
    <div className={styles.myParagraphs}>
      <div className={styles.content}>
        <h1 className={styles.heading}>My Paragraphs</h1>
        <p className={styles.message}>Your saved paragraphs will appear here.</p>
      </div>
    </div>
  );
};

MyParagraphs.displayName = 'MyParagraphs';

