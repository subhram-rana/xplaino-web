import React from 'react';
import styles from './MyWords.module.css';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoginModal } from '@/shared/components/LoginModal';

/**
 * MyWords - My Words page component
 * 
 * @returns JSX element
 */
export const MyWords: React.FC = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className={styles.myWords}>
        <LoginModal actionText="view your saved words" />
      </div>
    );
  }

  return (
    <div className={styles.myWords}>
      <div className={styles.content}>
        <h1 className={styles.heading}>My Words</h1>
        <p className={styles.message}>Your saved words will appear here.</p>
      </div>
    </div>
  );
};

MyWords.displayName = 'MyWords';

