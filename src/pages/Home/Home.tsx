import React, { Suspense, lazy } from 'react';
import { ScrollReveal } from '@/shared/components/ScrollReveal';
import { Promo } from './components/Promo';
import { ChromeButton } from '@/shared/components/ChromeButton';
import styles from './Home.module.css';

const FeatureSet = lazy(() => import('./components/FeatureSet').then((m) => ({ default: m.FeatureSet })));
const UseCase = lazy(() => import('./components/UseCase').then((m) => ({ default: m.UseCase })));
const SupportedLanguages = lazy(() => import('./components/SupportedLanguages').then((m) => ({ default: m.SupportedLanguages })));
const Support = lazy(() => import('./components/Support').then((m) => ({ default: m.Support })));

/**
 * Home - Home page component
 * 
 * @returns JSX element
 */
export const Home: React.FC = () => {
  return (
    <div className={styles.home}>
      <Promo />
      <Suspense fallback={null}>
        <FeatureSet />
      </Suspense>
      <Suspense fallback={null}>
        <UseCase />
      </Suspense>
      <Suspense fallback={null}>
        <SupportedLanguages />
      </Suspense>
      <Suspense fallback={null}>
        <Support />
      </Suspense>
      <ScrollReveal variant="fadeUp">
        <div className={styles.ctaWrapper}>
          <div className={styles.chromeButtonContainer}>
            <h2 className={styles.ctaHeading}>Understand anything instantly—right as you browse</h2>
            <p className={styles.ctaSubtext}>Get AI-powered explanations, summaries, and translations on any webpage — transform how you learn online in seconds.</p>
            <ChromeButton />
            <p className={styles.trustBadge}>
              <span className={styles.trustIcon}>✨</span>
              Join thousands of curious minds
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

Home.displayName = 'Home';
