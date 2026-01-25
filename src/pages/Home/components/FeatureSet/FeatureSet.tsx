import React from 'react';
import { FeatureContainer } from './FeatureContainer';
import styles from './FeatureSet.module.css';

/**
 * FeatureSet - Feature set section with vertical containers in alternating layout
 * 
 * @returns JSX element
 */
export const FeatureSet: React.FC = () => {
  // Placeholder data - will be replaced with actual data
  const features = [
    { 
      id: 1, 
      title: 'No need to change DARK and LIGHT theme everytime', 
      videoUrl: 'https://static-web.maxai.photos/videos/landing/homepage-v3/primary.mp4?t=1',
      bullets: [
        'Set your preferred theme once for each website',
        'Different websites can have different theme settings',
        'Theme auto-applies every time you visit the configured website'
      ]
    },
  ];

  return (
    <section className={styles.featureSet}>
      <h2 className={styles.heading}>Features</h2>
      <p className={styles.subheading}>Everything you need to understand better</p>
      <div className={styles.containerList}>
        {features.map((feature, index) => (
          <FeatureContainer
            key={feature.id}
            title={feature.title}
            videoUrl={feature.videoUrl}
            bullets={feature.bullets}
            isReversed={index % 2 === 1} // Alternate: even index = normal, odd index = reversed
          />
        ))}
      </div>
    </section>
  );
};

FeatureSet.displayName = 'FeatureSet';

