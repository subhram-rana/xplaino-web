import React from 'react';
import styles from './MyPages.module.css';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoginModal } from '@/shared/components/LoginModal';

/**
 * MyPages - My Pages page component
 * 
 * @returns JSX element
 */
export const MyPages: React.FC = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className={styles.myPages}>
        <LoginModal actionText="view your saved pages" />
      </div>
    );
  }

  return (
    <div className={styles.myPages}>
      <div className={styles.content}>
        <h1 className={styles.heading}>My Pages</h1>
        <p className={styles.message}>Your saved pages will appear here.</p>
      </div>
    </div>
  );
};

MyPages.displayName = 'MyPages';

