import React from 'react';
import styles from './Home.module.css';

/**
 * Home - Home page component
 * 
 * @returns JSX element
 */
export const Home: React.FC = () => {
  return (
    <div className={styles.home}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Xplaino</h1>
        <p className={styles.subtitle}>Your home page content goes here</p>
      </div>
    </div>
  );
};

Home.displayName = 'Home';

