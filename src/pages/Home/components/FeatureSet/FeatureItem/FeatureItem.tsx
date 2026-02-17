import React, { useRef, useState } from 'react';
import { VideoModal } from '../VideoModal/VideoModal';
import styles from './FeatureItem.module.css';

interface FeatureItemProps {
  title: string;
  videoUrl: string;
}

/**
 * FeatureItem - Individual feature item with auto-playing video and maximize button
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const FeatureItem: React.FC<FeatureItemProps> = ({ title, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVideoClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={styles.featureItem}>
        <div ref={containerRef} className={styles.videoContainer} onClick={handleVideoClick}>
          <video
            ref={videoRef}
            className={styles.video}
            src={videoUrl}
            loop
            muted
            playsInline
          />
        </div>
        <h3 className={styles.title} onClick={handleVideoClick}>{title}</h3>
      </div>
      <VideoModal
        isOpen={isModalOpen}
        videoUrl={videoUrl}
        title={title}
        sourceElement={containerRef.current}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

FeatureItem.displayName = 'FeatureItem';

