import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './VideoModal.module.css';

interface VideoModalProps {
  isOpen: boolean;
  videoUrl: string;
  title: string;
  bullets?: string[];
  sourceElement?: HTMLElement | null;
  onClose: () => void;
}

/**
 * VideoModal - Modal component for playing videos with controls
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, videoUrl, title, bullets, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const scrollPositionRef = useRef<number>(0);
  const wasOpenRef = useRef<boolean>(false);
  
  // Check if the video URL is a YouTube embed
  const isYouTubeEmbed = videoUrl.includes('youtube.com/embed');

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      const scrollY = scrollPositionRef.current;
      // Keep overflow hidden while restoring position to prevent intermediate paint
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      // Restore scroll position in the same JS frame
      window.scrollTo(0, scrollY);
      // Restore overflow on next frame after scroll is applied
      requestAnimationFrame(() => {
        document.body.style.overflow = '';
      });
      scrollPositionRef.current = 0;
      wasOpenRef.current = false;
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      wasOpenRef.current = true;
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    }
    // Cleanup on unmount only
    return () => {
      if (document.body.style.position === 'fixed') {
        const scrollY = scrollPositionRef.current;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen && !isClosing) return null;

  const modalContent = (
    <div className={`${styles.modalOverlay} ${isClosing ? styles.modalOverlayClosing : ''}`} onClick={handleClose}>
      <div 
        className={`${styles.modalContent} ${isClosing ? styles.modalClosing : isOpen ? styles.modalOpening : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className={styles.modalBody}>
          {/* Left side - Video */}
          <div className={styles.videoColumn}>
            <div className={styles.videoWrapper}>
              {isYouTubeEmbed ? (
                <iframe
                  className={styles.video}
                  src={videoUrl}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  className={styles.video}
                  src={videoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </div>
            {!isYouTubeEmbed && (
              <div className={styles.controls}>
                <button className={styles.controlButton} onClick={handlePlayPause}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className={styles.seekBar}
                />
                <span className={styles.time}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Feature List */}
          {bullets && bullets.length > 0 && (
            <div className={styles.featureColumn}>
              <h4 className={styles.featureTitle}>Key Features</h4>
              <ul className={styles.bulletList}>
                {bullets.map((bullet, index) => (
                  <li key={index} className={styles.bulletItem}>{bullet}</li>
                ))}
              </ul>
              <button 
                className={styles.descriptionCloseButton} 
                onClick={handleClose}
                aria-label="Close modal"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

VideoModal.displayName = 'VideoModal';
