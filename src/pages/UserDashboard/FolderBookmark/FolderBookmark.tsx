import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './FolderBookmark.module.css';

/**
 * FolderBookmark - Folder detail page with tabbed content
 * 
 * @returns JSX element
 */
export const FolderBookmark: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'paragraph' | 'link' | 'word' | 'image'>('paragraph');

  // Get folder data from navigation state if available
  const folder = (location.state as { folder?: { id: string; name: string } })?.folder;

  const folderName = folder?.name || `Folder ${folderId}`;

  return (
    <div className={styles.folderBookmark}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/user/dashboard')}
          >
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          <h1 className={styles.heading}>{folderName}</h1>
          <div className={styles.headerSpacer}></div>
        </div>

        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'paragraph' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('paragraph')}
            >
              Paragraph
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'link' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('link')}
            >
              Link
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'word' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('word')}
            >
              Word
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'image' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('image')}
            >
              Image
            </button>
          </div>
          <div className={styles.tabContent}>
            <p>Content for {activeTab} in {folderName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

FolderBookmark.displayName = 'FolderBookmark';

