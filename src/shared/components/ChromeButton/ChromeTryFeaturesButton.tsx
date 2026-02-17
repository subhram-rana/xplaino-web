import React from 'react';
import chromeIcon from '../../../assets/images/google-chrome-icon.png';
import styles from './ChromeTryFeaturesButton.module.css';

/**
 * ChromeTryFeaturesButton - CTA for Getting Started page
 * Tells users they must install the extension to try features.
 */
export const ChromeTryFeaturesButton: React.FC = () => {
  const handleButtonClick = () => {
    window.open(
      'https://chromewebstore.google.com/detail/xplaino/nmphalmbdmddagbllhjnfnmodfmbnlkp',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className={styles.ctaCard}>
      <div className={styles.iconCircle}>
        <img src={chromeIcon} alt="Chrome Logo" className={styles.chromeLogo} />
      </div>
      <div className={styles.textBlock}>
        <div className={styles.title}>Install the Xplaino Chrome extension</div>
        <div className={styles.subtitle}>
          Add the extension to your browser to interact with this article and try all the features on real pages.
        </div>
      </div>
      <button className={styles.ctaLink} onClick={handleButtonClick}>
        Install from Chrome Web Store
        <span className={styles.ctaArrow}>↗</span>
      </button>
    </div>
  );
};

ChromeTryFeaturesButton.displayName = 'ChromeTryFeaturesButton';

