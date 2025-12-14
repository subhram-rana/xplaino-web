import React from 'react';
import styles from './PromoVideo.module.css';

/**
 * PromoVideo - Non-interactive promo video player
 * 
 * @returns JSX element
 */
export const PromoVideo: React.FC = () => {
  return (
    <div className={styles.promoVideo}>
      <video
        className={styles.video}
        src="https://static-web.maxai.photos/videos/landing/homepage-v3/primary.mp4?t=1"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

PromoVideo.displayName = 'PromoVideo';

