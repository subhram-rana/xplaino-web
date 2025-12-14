import React from 'react';
import { FeatureItem } from './FeatureItem/FeatureItem';
import styles from './FeatureSet.module.css';

/**
 * FeatureSet - Feature set section with grid of feature items
 * 
 * @returns JSX element
 */
export const FeatureSet: React.FC = () => {
  // Placeholder data - will be replaced with actual data
  const features = [
    { id: 1, title: 'Summarise page', videoUrl: 'https://static-web.maxai.photos/videos/landing/homepage-v3/primary.mp4?t=1' },
    { id: 2, title: 'Dont forget while you read further', videoUrl: 'https://static-web.maxai.photos/videos/landing/homepage-v3/primary.mp4?t=1' },
    { id: 3, title: 'Explain paragraph', videoUrl: 'https://static-web.maxai.photos/videos/landing/homepage-v3/primary.mp4?t=1' },
    { id: 4, title: 'Get related questions', videoUrl: 'https://static-web.maxai.photos/videos/landing/homepage-v3/primary.mp4?t=1' },
    { id: 5, title: 'Explore a word in depth', videoUrl: 'https://static-web.maxai.photos/videos/landing/homepage-v3/primary.mp4?t=1' },
    { id: 6, title: 'Do not forget where you have read', videoUrl: 'https://static-web.maxai.photos/videos/landing/homepage-v3/primary.mp4?t=1' },
  ];

  return (
    <section className={styles.featureSet}>
      <h2 className={styles.heading}>Features</h2>
      <div className={styles.grid}>
        {features.map((feature) => (
          <FeatureItem
            key={feature.id}
            title={feature.title}
            videoUrl={feature.videoUrl}
          />
        ))}
      </div>
    </section>
  );
};

FeatureSet.displayName = 'FeatureSet';

