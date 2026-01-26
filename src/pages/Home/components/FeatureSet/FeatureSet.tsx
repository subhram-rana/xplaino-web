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
      title: 'Different themes for different websites', 
      videoUrl: 'https://ik.imagekit.io/subhram/xplaino/website-videos/theme.mov/ik-video.mp4',
      bullets: [
        'No global theme — set Light or Dark individually for each website',
        'Switch between websites without toggling themes manually'
      ]
    },
    {
      id: 2,
      title: 'Revisit what you just learned',
      videoUrl: '',
      bullets: [
        'All AI explanations for words, text, images, summaries, and translations are stored right in the UI',
        'Previous conversations stay intact while you explore new topics'
      ]
    },
    {
      id: 3,
      title: 'Master any word with one click',
      videoUrl: '',
      bullets: [
        'Get contextual explanations with real examples, synonyms, antonyms, and instant translation to your native language',
        'Ask follow-up questions about the word — in context or in general — with built-in smart prompts for detailed, clear answers',
        'Save words to your personal dashboard and track your vocabulary growth over time',
        'Jump back to the original webpage where you discovered the word with one click'
      ]
    },
    {
      id: 4,
      title: 'Understand any text instantly',
      videoUrl: '',
      bullets: [
        'Select any text or paragraph and get AI-powered contextual explanations — ask follow-up questions to dive deeper',
        'Translate selections to your native language or any language you choose',
        'Bookmark important passages to your dashboard and summarize all your saved content with one click',
        'Trace back to the source webpage instantly from your saved text'
      ]
    },
    {
      id: 5,
      title: 'Decode any image with AI',
      videoUrl: '',
      bullets: [
        'Click on any image and get instant AI-powered explanations — understand diagrams, charts, infographics, and more',
        'Ask follow-up questions to explore details, context, or anything you\'re curious about',
        'Save images to your dashboard for quick reference and revisit your visual learning anytime',
        'Navigate back to the original webpage where you found the image in one click'
      ]
    },
    {
      id: 6,
      title: 'Summarize any webpage in seconds',
      videoUrl: '',
      bullets: [
        'Get a concise AI-generated summary of any webpage — skip the fluff and grasp the key points instantly',
        'Each summary point links back to the exact section of the page it came from, so you can dive deeper when needed',
        'Auto-generated follow-up questions help you build context faster without guessing what to ask',
        'Save summaries to your dashboard with the original link — revisit anytime and trace back to the source'
      ]
    },
    {
      id: 7,
      title: 'Translate entire webpages instantly',
      videoUrl: '',
      bullets: [
        'Translate any webpage into your preferred language in seconds — no copy-pasting, no extra tabs',
        'Replace the original content seamlessly so the page feels like it was written in your native language',
        'Or view translations side-by-side with the original text for easy comparison and learning',
        'Toggle translations on or off anytime — switch between views with a single click'
      ]
    },
    {
      id: 8,
      title: 'Your personal knowledge hub',
      videoUrl: '',
      bullets: [
        'Save words, passages, images, and webpage summaries — all organized in one powerful dashboard',
        'Every saved item links back to its original source, so you never lose context',
        'Generate a consolidated summary across all your saved passages and ask follow-up questions about everything at once',
        'Build your own knowledge library over time and revisit your learning journey anytime'
      ]
    },
    {
      id: 9,
      title: 'We\'ve got your back — always',
      videoUrl: '',
      bullets: [
        'Report any issue directly from the extension and we\'ll prioritize resolving it as fast as possible',
        'Your time and money matter to us — we\'re committed to making every feature work seamlessly for you',
        'Get real support from real people who care about your experience, not bots or endless FAQs',
        'We build with you in mind — your feedback shapes the product you use every day'
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

