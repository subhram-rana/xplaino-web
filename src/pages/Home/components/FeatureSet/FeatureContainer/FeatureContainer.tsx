import React, { useRef, useState } from 'react';
import { VideoModal } from '../VideoModal/VideoModal';
import styles from './FeatureContainer.module.css';

interface FeatureContainerProps {
  title: string;
  videoUrl: string;
  bullets: string[];
  icon?: string;
}

/**
 * FeatureContainer - Compact feature card with video and expandable description
 * Shows video + title by default, reveals description below on hover (desktop) or tap (mobile)
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const FeatureContainer: React.FC<FeatureContainerProps> = ({ 
  title, 
  videoUrl, 
  bullets,
  icon
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if the video URL is a YouTube embed
  const isYouTubeEmbed = videoUrl.includes('youtube.com/embed');
  
  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
    const videoId = url.split('/embed/')[1]?.split('?')[0];
    return videoId || null;
  };

  const youtubeVideoId = isYouTubeEmbed ? getYouTubeVideoId(videoUrl) : null;
  const youtubeThumbnailUrl = youtubeVideoId
    ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
    : null;

  const handleVideoClick = () => {
    setIsModalOpen(true);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  return (
    <>
      <div 
        ref={containerRef}
        className={`${styles.featureContainer} ${isExpanded ? styles.expanded : ''}`}
      >
        {/* Video Section - now shows a static thumbnail, opens modal on click */}
        <div 
          ref={videoSectionRef}
          className={styles.videoSection} 
          onClick={handleVideoClick}
        >
          {isYouTubeEmbed ? (
            <div className={styles.thumbnailWrapper}>
              {youtubeThumbnailUrl && (
                <img
                  src={youtubeThumbnailUrl}
                  alt={title}
                  className={styles.thumbnail}
                  loading="lazy"
                />
              )}
              <div className={styles.playOverlay} aria-hidden="true">
                <span className={styles.playIcon}>▶</span>
              </div>
            </div>
          ) : (
            <div className={styles.thumbnailWrapper}>
              <div className={styles.fallbackThumbnail} />
              <div className={styles.playOverlay} aria-hidden="true">
                <span className={styles.playIcon}>▶</span>
              </div>
            </div>
          )}
        </div>

        {/* Title Section - always visible below video */}
        <div className={styles.titleSection}>
          <h3 className={styles.heading}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {title}
          </h3>
          
          {/* Expand indicator for mobile */}
          <button 
            className={styles.expandButton}
            onClick={handleExpandToggle}
            aria-label={isExpanded ? "Collapse description" : "Expand description"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        {/* Description Section - expands on hover (desktop) or tap (mobile) */}
        <div className={styles.descriptionSection}>
          <ul className={styles.bulletList}>
            {bullets.map((bullet, index) => (
              <li key={index} className={styles.bulletItem}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>

      <VideoModal
        isOpen={isModalOpen}
        videoUrl={isYouTubeEmbed ? `${videoUrl.split('?')[0]}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&vq=hd720` : videoUrl}
        title={title}
        bullets={bullets}
        sourceElement={videoSectionRef.current}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

FeatureContainer.displayName = 'FeatureContainer';
