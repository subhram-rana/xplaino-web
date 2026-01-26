import React from 'react';
import styles from './UseCase.module.css';

/**
 * UseCase - Use case section with scrolling text
 * 
 * @returns JSX element
 */
export const UseCase: React.FC = () => {
  const useCases = [
    'Language learning',
    'Research',
    'Marketing',
    'Data Analysis',
    'Productivity',
    'Translation',
  ];

  return (
    <div className={styles.useCaseWrapper}>
      <section className={styles.useCase}>
        <h2 className={styles.subheading}>Use cases</h2>
        <div className={styles.scrollingContainer}>
          <div className={styles.scrollingContent}>
            {useCases.map((useCase, index) => (
              <span key={index} className={styles.useCaseItem}>
                {useCase}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {useCases.map((useCase, index) => (
              <span key={`duplicate-${index}`} className={styles.useCaseItem}>
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

UseCase.displayName = 'UseCase';




