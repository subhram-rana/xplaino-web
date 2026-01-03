import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiExternalLink, FiCopy, FiCheck, FiInfo, FiX, FiGlobe, FiEye, FiEyeOff } from 'react-icons/fi';
import { SiYoutube, SiLinkedin, SiX, SiReddit, SiFacebook, SiInstagram } from 'react-icons/si';
import styles from './FolderBookmark.module.css';
import { useAuth } from '@/shared/hooks/useAuth';
import { getAllSavedParagraphs } from '@/shared/services/paragraphs.service';
import { getAllSavedLinksByFolderId } from '@/shared/services/links.service';
import { getSavedWordsByFolderId } from '@/shared/services/words.service';
import { getAllSavedImagesByFolderId } from '@/shared/services/images.service';
import type { GetAllSavedParagraphsResponse } from '@/shared/types/paragraphs.types';
import type { GetAllSavedLinksResponse } from '@/shared/types/links.types';
import type { GetSavedWordsResponse } from '@/shared/types/words.types';
import type { GetAllSavedImagesResponse } from '@/shared/types/images.types';
import { FolderIcon } from '@/shared/components/FolderIcon';
import { Toast } from '@/shared/components/Toast';

/**
 * FolderBookmark - Folder detail page with tabbed content
 * 
 * @returns JSX element
 */
export const FolderBookmark: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'paragraph' | 'link' | 'word' | 'image'>('paragraph');
  
  // Data states for each tab
  const [paragraphsData, setParagraphsData] = useState<GetAllSavedParagraphsResponse | null>(null);
  const [paragraphsLoading, setParagraphsLoading] = useState(false);
  const [paragraphsLoadingMore, setParagraphsLoadingMore] = useState(false);
  const [paragraphsError, setParagraphsError] = useState<string | null>(null);
  const [paragraphsHasMore, setParagraphsHasMore] = useState(false);
  
  const [linksData, setLinksData] = useState<GetAllSavedLinksResponse | null>(null);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksLoadingMore, setLinksLoadingMore] = useState(false);
  const [linksError, setLinksError] = useState<string | null>(null);
  const [linksHasMore, setLinksHasMore] = useState(false);
  
  const [wordsData, setWordsData] = useState<GetSavedWordsResponse | null>(null);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordsLoadingMore, setWordsLoadingMore] = useState(false);
  const [wordsError, setWordsError] = useState<string | null>(null);
  const [wordsHasMore, setWordsHasMore] = useState(false);
  
  const [imagesData, setImagesData] = useState<GetAllSavedImagesResponse | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesLoadingMore, setImagesLoadingMore] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [imagesHasMore, setImagesHasMore] = useState(false);
  
  // Track which tabs have loaded data
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());
  const [refreshingTab, setRefreshingTab] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [copiedWordId, setCopiedWordId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string | null; sourceUrl: string; id?: string; createdAt?: string } | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isImageModalClosing, setIsImageModalClosing] = useState(false);
  const [isNameColumnVisible, setIsNameColumnVisible] = useState(true);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredInfoId, setHoveredInfoId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const [tooltipData, setTooltipData] = useState<{ bookmarkTime: string; source: string } | null>(null);
  const infoIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInfoIconClick = useCallback((id: string, bookmarkTime: string, source: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // If clicking the same icon, toggle tooltip
    if (hoveredInfoId === id && tooltipPosition) {
      setHoveredInfoId(null);
      setTooltipPosition(null);
      setTooltipData(null);
      return;
    }
    // Clear any pending timeouts
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    if (tooltipShowTimeoutRef.current) {
      clearTimeout(tooltipShowTimeoutRef.current);
      tooltipShowTimeoutRef.current = null;
    }
    const target = e.currentTarget as HTMLElement;
    if (target) {
      const rect = target.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 20,
        left: rect.left + rect.width / 2
      });
      setTooltipData({ bookmarkTime, source });
      setHoveredInfoId(id);
    }
  }, [hoveredInfoId, tooltipPosition]);

  // Get icon component based on link type
  const getTypeIcon = (type: string) => {
    const iconProps = { size: 20, className: styles.typeIcon };
    switch (type.toUpperCase()) {
      case 'WEBPAGE':
        return <FiGlobe {...iconProps} />;
      case 'YOUTUBE':
        return <SiYoutube {...iconProps} />;
      case 'LINKEDIN':
        return <SiLinkedin {...iconProps} />;
      case 'TWITTER':
        return <SiX {...iconProps} />;
      case 'REDDIT':
        return <SiReddit {...iconProps} />;
      case 'FACEBOOK':
        return <SiFacebook {...iconProps} />;
      case 'INSTAGRAM':
        return <SiInstagram {...iconProps} />;
      default:
        return <FiGlobe {...iconProps} />;
    }
  };

  // Get folder data from navigation state if available
  const folder = (location.state as { folder?: { id: string; name: string } })?.folder;
  const folderName = folder?.name || `Folder ${folderId}`;

  // Fetch functions
  const fetchParagraphs = useCallback(async (forceRefresh = false, append = false) => {
    if (!accessToken || !folderId) return;
    if (!forceRefresh && !append && loadedTabs.has('paragraph')) return;

    const offset = append && paragraphsData ? paragraphsData.offset + paragraphsData.limit : 0;
    
    if (append) {
      setParagraphsLoadingMore(true);
    } else {
      setParagraphsLoading(true);
      setParagraphsError(null);
      if (forceRefresh) {
        setParagraphsData(null);
      }
    }
    
    try {
      const data = await getAllSavedParagraphs(accessToken, folderId, offset, 20);
      if (append && paragraphsData) {
        // Append new data to existing
        setParagraphsData({
          ...data,
          saved_paragraphs: [...paragraphsData.saved_paragraphs, ...data.saved_paragraphs],
          sub_folders: paragraphsData.sub_folders.length > 0 ? paragraphsData.sub_folders : data.sub_folders,
        });
      } else {
        setParagraphsData(data);
        setLoadedTabs(prev => new Set(prev).add('paragraph'));
      }
      setParagraphsHasMore(data.has_next);
    } catch (error) {
      console.error('Error fetching paragraphs:', error);
      if (!append) {
        setParagraphsError(error instanceof Error ? error.message : 'Failed to fetch paragraphs');
      }
    } finally {
      setParagraphsLoading(false);
      setParagraphsLoadingMore(false);
    }
  }, [accessToken, folderId, loadedTabs, paragraphsData]);

  const fetchLinks = useCallback(async (forceRefresh = false, append = false) => {
    if (!accessToken || !folderId) return;
    if (!forceRefresh && !append && loadedTabs.has('link')) return;

    const offset = append && linksData ? linksData.offset + linksData.limit : 0;
    
    if (append) {
      setLinksLoadingMore(true);
    } else {
      setLinksLoading(true);
      setLinksError(null);
      if (forceRefresh) {
        setLinksData(null);
      }
    }
    
    try {
      const data = await getAllSavedLinksByFolderId(accessToken, folderId, offset, 20);
      if (append && linksData) {
        setLinksData({
          ...data,
          saved_links: [...linksData.saved_links, ...data.saved_links],
          sub_folders: linksData.sub_folders.length > 0 ? linksData.sub_folders : data.sub_folders,
        });
      } else {
        setLinksData(data);
        setLoadedTabs(prev => new Set(prev).add('link'));
      }
      setLinksHasMore(data.has_next);
    } catch (error) {
      console.error('Error fetching links:', error);
      if (!append) {
        setLinksError(error instanceof Error ? error.message : 'Failed to fetch links');
      }
    } finally {
      setLinksLoading(false);
      setLinksLoadingMore(false);
    }
  }, [accessToken, folderId, loadedTabs, linksData]);

  const fetchWords = useCallback(async (forceRefresh = false, append = false) => {
    if (!accessToken || !folderId) return;
    if (!forceRefresh && !append && loadedTabs.has('word')) return;

    const offset = append && wordsData ? wordsData.offset + wordsData.limit : 0;
    
    if (append) {
      setWordsLoadingMore(true);
    } else {
      setWordsLoading(true);
      setWordsError(null);
      if (forceRefresh) {
        setWordsData(null);
      }
    }
    
    try {
      const data = await getSavedWordsByFolderId(accessToken, folderId, offset, 20);
      if (append && wordsData) {
        setWordsData({
          ...data,
          words: [...wordsData.words, ...data.words],
        });
      } else {
        setWordsData(data);
        setLoadedTabs(prev => new Set(prev).add('word'));
      }
      // Calculate hasMore for words (no has_next in response)
      const hasMore = data.offset + data.limit < data.total;
      setWordsHasMore(hasMore);
    } catch (error) {
      console.error('Error fetching words:', error);
      if (!append) {
        setWordsError(error instanceof Error ? error.message : 'Failed to fetch words');
      }
    } finally {
      setWordsLoading(false);
      setWordsLoadingMore(false);
    }
  }, [accessToken, folderId, loadedTabs, wordsData]);

  const fetchImages = useCallback(async (forceRefresh = false, append = false) => {
    if (!accessToken || !folderId) return;
    if (!forceRefresh && !append && loadedTabs.has('image')) return;

    const offset = append && imagesData ? imagesData.offset + imagesData.limit : 0;
    
    if (append) {
      setImagesLoadingMore(true);
    } else {
      setImagesLoading(true);
      setImagesError(null);
      if (forceRefresh) {
        setImagesData(null);
      }
    }
    
    try {
      const data = await getAllSavedImagesByFolderId(accessToken, folderId, offset, 20);
      if (append && imagesData) {
        setImagesData({
          ...data,
          images: [...imagesData.images, ...data.images],
        });
      } else {
        setImagesData(data);
        setLoadedTabs(prev => new Set(prev).add('image'));
      }
      setImagesHasMore(data.has_next);
    } catch (error) {
      console.error('Error fetching images:', error);
      if (!append) {
        setImagesError(error instanceof Error ? error.message : 'Failed to fetch images');
      }
    } finally {
      setImagesLoading(false);
      setImagesLoadingMore(false);
    }
  }, [accessToken, folderId, loadedTabs, imagesData]);

  // Fetch data when tab changes
  useEffect(() => {
    if (!accessToken || !folderId) return;

    switch (activeTab) {
      case 'paragraph':
        if (!loadedTabs.has('paragraph')) {
          fetchParagraphs();
        }
        break;
      case 'link':
        if (!loadedTabs.has('link')) {
          fetchLinks();
        }
        break;
      case 'word':
        if (!loadedTabs.has('word')) {
          fetchWords();
        }
        break;
      case 'image':
        if (!loadedTabs.has('image')) {
          fetchImages();
        }
        break;
    }
  }, [activeTab, accessToken, folderId, loadedTabs, fetchParagraphs, fetchLinks, fetchWords, fetchImages]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (tooltipShowTimeoutRef.current) {
        clearTimeout(tooltipShowTimeoutRef.current);
      }
    };
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hoveredInfoId && tooltipPosition) {
        const target = event.target as HTMLElement;
        const iconElement = infoIconRefs.current[hoveredInfoId];
        
        // Don't close if clicking on the icon
        if (iconElement?.contains(target)) {
          return;
        }
        
        // Check if clicking on tooltip
        const tooltipElement = document.querySelector('[class*="tooltip"]');
        if (tooltipElement?.contains(target)) {
          return;
        }
        
        setHoveredInfoId(null);
        setTooltipPosition(null);
        setTooltipData(null);
      }
    };

    if (hoveredInfoId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hoveredInfoId, tooltipPosition]);

  // Handle closing image modal with animation
  const handleCloseImageModal = useCallback(() => {
    setIsImageModalClosing(true);
    setTimeout(() => {
      setIsImageModalOpen(false);
      setIsImageModalClosing(false);
      setSelectedImage(null);
    }, 300); // Match animation duration
  }, []);

  // Handle ESC key to close image modal and prevent body scroll
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen && !isImageModalClosing) {
        handleCloseImageModal();
      }
    };

    if (isImageModalOpen) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // Prevent body scroll and compensate for scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.addEventListener('keydown', handleEscKey);
    } else {
      // Restore body scroll and remove padding
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isImageModalOpen, isImageModalClosing, handleCloseImageModal]);

  // Refresh handlers
  const handleRefreshParagraphs = async () => {
    setActiveTab('paragraph');
    setRefreshingTab('paragraph');
    setParagraphsHasMore(false);
    try {
      await fetchParagraphs(true);
      setToast({ message: 'Paragraphs refreshed successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to refresh paragraphs', type: 'error' });
    } finally {
      setRefreshingTab(null);
    }
  };

  const handleRefreshLinks = async () => {
    setActiveTab('link');
    setRefreshingTab('link');
    setLinksHasMore(false);
    try {
      await fetchLinks(true);
      setToast({ message: 'Links refreshed successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to refresh links', type: 'error' });
    } finally {
      setRefreshingTab(null);
    }
  };

  const handleRefreshWords = async () => {
    setActiveTab('word');
    setRefreshingTab('word');
    setWordsHasMore(false);
    try {
      await fetchWords(true);
      setToast({ message: 'Words refreshed successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to refresh words', type: 'error' });
    } finally {
      setRefreshingTab(null);
    }
  };

  const handleRefreshImages = async () => {
    setActiveTab('image');
    setRefreshingTab('image');
    setImagesHasMore(false);
    try {
      await fetchImages(true);
      setToast({ message: 'Images refreshed successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to refresh images', type: 'error' });
    } finally {
      setRefreshingTab(null);
    }
  };

  // Scroll detection for infinite scroll (using window scroll)
  useEffect(() => {
    if (activeTab !== 'paragraph' || paragraphsLoading || paragraphsLoadingMore || !paragraphsHasMore) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Load more when user is 300px from bottom
      if (scrollHeight - scrollTop - clientHeight < 300) {
        fetchParagraphs(false, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, paragraphsLoading, paragraphsLoadingMore, paragraphsHasMore, fetchParagraphs]);

  useEffect(() => {
    if (activeTab !== 'link' || linksLoading || linksLoadingMore || !linksHasMore) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollHeight - scrollTop - clientHeight < 300) {
        fetchLinks(false, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, linksLoading, linksLoadingMore, linksHasMore, fetchLinks]);

  useEffect(() => {
    if (activeTab !== 'word' || wordsLoading || wordsLoadingMore || !wordsHasMore) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollHeight - scrollTop - clientHeight < 300) {
        fetchWords(false, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, wordsLoading, wordsLoadingMore, wordsHasMore, fetchWords]);

  useEffect(() => {
    if (activeTab !== 'image' || imagesLoading || imagesLoadingMore || !imagesHasMore) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollHeight - scrollTop - clientHeight < 300) {
        fetchImages(false, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, imagesLoading, imagesLoadingMore, imagesHasMore, fetchImages]);

  const handleCopyWord = (word: string, wordId: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWordId(wordId);
    setTimeout(() => setCopiedWordId(null), 2000);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getFirst7Words = (content: string): string => {
    const words = content.trim().split(/\s+/);
    return words.slice(0, 7).join(' ');
  };

  const handleSourceLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sourceUrl: string, content: string) => {
    e.preventDefault();
    const first7Words = getFirst7Words(content);
    const encodedContent = encodeURIComponent(first7Words);
    
    try {
      const url = new URL(sourceUrl);
      url.searchParams.set('xlpaino_content', encodedContent);
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      const separator = sourceUrl.includes('?') ? '&' : '?';
      const urlWithParam = `${sourceUrl}${separator}xlpaino_content=${encodedContent}`;
      window.open(urlWithParam, '_blank', 'noopener,noreferrer');
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'paragraph':
        if (paragraphsLoading) {
          return <div className={styles.loading}>Loading paragraphs...</div>;
        }
        if (paragraphsError) {
          return <div className={styles.error}>Error: {paragraphsError}</div>;
        }
        if (!paragraphsData) {
          return <div className={styles.emptyState}>No data available</div>;
        }
        return (
          <>
            {/* Sub-folders */}
            {paragraphsData.sub_folders.length > 0 && (
              <div className={styles.foldersSection}>
                <h3 className={styles.sectionTitle}>Folders</h3>
                <div className={styles.foldersGrid}>
                  {paragraphsData.sub_folders.map((subFolder) => (
                    <div
                      key={subFolder.id}
                      className={styles.folderCard}
                      onClick={() => navigate(`/user/dashboard/bookmark/${subFolder.id}`, {
                        state: { folder: { id: subFolder.id, name: subFolder.name } }
                      })}
                    >
                      <FolderIcon size={32} />
                      <span className={styles.folderCardName}>{subFolder.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Paragraphs Table */}
            {paragraphsData.saved_paragraphs.length > 0 ? (
              <>
                {!isNameColumnVisible && (
                  <div className={styles.tableControls}>
                    <button
                      className={styles.eyeToggleButton}
                      onClick={() => setIsNameColumnVisible(true)}
                      title="Show name column"
                      aria-label="Show name column"
                    >
                      <FiEye />
                      <span>Show Name</span>
                    </button>
                  </div>
                )}
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={isNameColumnVisible ? '' : styles.hiddenColumn}>
                          <div className={styles.columnHeaderWithIcon}>
                            <span>Name</span>
                            {isNameColumnVisible && (
                              <button
                                className={styles.eyeToggleButtonHeader}
                                onClick={() => setIsNameColumnVisible(false)}
                                title="Hide name column"
                                aria-label="Hide name column"
                              >
                                <FiEyeOff />
                              </button>
                            )}
                          </div>
                        </th>
                        <th>Content</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                  <tbody>
                  {paragraphsData.saved_paragraphs.map((para) => (
                      <tr 
                        key={para.id}
                        onMouseEnter={() => setHoveredRowId(para.id)}
                        onMouseLeave={() => {
                          setHoveredRowId(null);
                          if (hoveredInfoId !== para.id) {
                            setHoveredInfoId(null);
                            setTooltipPosition(null);
                            setTooltipData(null);
                          }
                        }}
                      >
                        <td className={isNameColumnVisible ? '' : styles.hiddenColumn}>
                          {para.name || ''}
                        </td>
                        <td className={styles.contentColumn}>
                          <div className={styles.contentCell}>
                            {para.content.length > 150
                              ? `${para.content.substring(0, 150)}...`
                              : para.content}
                      </div>
                        </td>
                        <td>
                          <div className={styles.sourceCell}>
                            {para.source_url ? (
                        <a
                          href={para.source_url}
                          onClick={(e) => handleSourceLinkClick(e, para.source_url, para.content)}
                                className={styles.iconLink}
                          target="_blank"
                          rel="noopener noreferrer"
                                title={para.source_url}
                              >
                                <FiExternalLink />
                              </a>
                            ) : (
                              <span className={styles.noSource}>—</span>
                            )}
                            {hoveredRowId === para.id && (
                              <div 
                                ref={(el) => {
                                  if (el) {
                                    infoIconRefs.current[para.id] = el;
                                  }
                                }}
                                className={`${styles.infoIconContainer} ${hoveredRowId === para.id ? styles.infoIconVisible : styles.infoIconHidden}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInfoIconClick(para.id, formatDate(para.created_at), para.source_url || 'No source', e);
                                }}
                              >
                                <FiInfo className={styles.infoIcon} />
                              </div>
                      )}
                    </div>
                          </td>
                        </tr>
                  ))}
                    </tbody>
                  </table>
                </div>
                {paragraphsLoadingMore && (
                  <div className={styles.loadingMore}>Loading more...</div>
                )}
              </>
            ) : paragraphsData.sub_folders.length === 0 ? (
              <div className={styles.emptyState}>No paragraphs or folders in this folder</div>
            ) : null}
          </>
        );

      case 'link':
        if (linksLoading) {
          return <div className={styles.loading}>Loading links...</div>;
        }
        if (linksError) {
          return <div className={styles.error}>Error: {linksError}</div>;
        }
        if (!linksData) {
          return <div className={styles.emptyState}>No data available</div>;
        }
        return (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.nameColumnHeader}>Name</th>
                  <th className={styles.urlColumnHeader}>URL</th>
                  <th className={styles.typeColumnHeader}>Type</th>
                </tr>
              </thead>
              <tbody>
                {linksData.saved_links.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.noData}>No links found</td>
                  </tr>
                ) : (
                  linksData.saved_links.map((link) => (
                    <tr 
                      key={link.id}
                      onMouseEnter={() => setHoveredRowId(link.id)}
                      onMouseLeave={() => {
                        setHoveredRowId(null);
                        if (hoveredInfoId !== link.id) {
                          setHoveredInfoId(null);
                          setTooltipPosition(null);
                          setTooltipData(null);
                        }
                      }}
                    >
                      <td className={styles.nameColumn}>
                        {link.name || ''}
                      </td>
                      <td className={styles.urlColumn}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                          {link.url}
                        </a>
                      </td>
                      <td>
                        <div className={styles.typeCell}>
                          <div className={styles.typeIconWrapper}>
                            {getTypeIcon(link.type)}
                          </div>
                          <div 
                            ref={(el) => {
                              if (el) {
                                infoIconRefs.current[link.id] = el;
                              }
                            }}
                            className={`${styles.infoIconContainer} ${hoveredRowId === link.id ? styles.infoIconVisible : styles.infoIconHidden}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInfoIconClick(link.id, formatDate(link.created_at), link.url || 'No source', e);
                            }}
                          >
                            <FiInfo className={styles.infoIcon} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {linksLoadingMore && (
              <div className={styles.loadingMore}>Loading more...</div>
            )}
          </div>
        );

      case 'word':
        if (wordsLoading) {
          return <div className={styles.loading}>Loading words...</div>;
        }
        if (wordsError) {
          return <div className={styles.error}>Error: {wordsError}</div>;
        }
        if (!wordsData) {
          return <div className={styles.emptyState}>No data available</div>;
        }
        return (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Meaning</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {wordsData.words.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.noData}>No words found</td>
                  </tr>
                ) : (
                  wordsData.words.map((word) => (
                    <tr 
                      key={word.id}
                      onMouseEnter={() => setHoveredRowId(word.id)}
                      onMouseLeave={() => {
                        setHoveredRowId(null);
                        if (hoveredInfoId !== word.id) {
                          setHoveredInfoId(null);
                          setTooltipPosition(null);
                          setTooltipData(null);
                        }
                      }}
                    >
                      <td>
                        <div className={styles.wordCell}>
                          <button
                            className={styles.copyButton}
                            onClick={() => handleCopyWord(word.word, word.id)}
                            title="Copy word"
                          >
                            {copiedWordId === word.id ? <FiCheck /> : <FiCopy />}
                          </button>
                          <span>{word.word}</span>
                        </div>
                      </td>
                      <td>{word.contextualMeaning || 'No meaning available'}</td>
                      <td>
                        <div className={styles.sourceCell}>
                          {word.sourceUrl ? (
                            <a 
                              href={word.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={styles.iconLink}
                              title={word.sourceUrl}
                            >
                              <FiExternalLink />
                            </a>
                          ) : (
                            <span className={styles.noSource}>—</span>
                          )}
                          <div 
                            ref={(el) => {
                              if (el) {
                                infoIconRefs.current[word.id] = el;
                              }
                            }}
                            className={`${styles.infoIconContainer} ${hoveredRowId === word.id ? styles.infoIconVisible : styles.infoIconHidden}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInfoIconClick(word.id, formatDate(word.createdAt), word.sourceUrl || 'No source', e);
                            }}
                          >
                            <FiInfo className={styles.infoIcon} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {wordsLoadingMore && (
              <div className={styles.loadingMore}>Loading more...</div>
            )}
          </div>
        );

      case 'image':
        if (imagesLoading) {
          return <div className={styles.loading}>Loading images...</div>;
        }
        if (imagesError) {
          return <div className={styles.error}>Error: {imagesError}</div>;
        }
        if (!imagesData) {
          return <div className={styles.emptyState}>No data available</div>;
        }
        return (
          <>
            {imagesData.images.length === 0 ? (
              <div className={styles.emptyState}>No images found</div>
            ) : (
              <>
                <div className={styles.imagesGrid}>
                  {imagesData.images.map((image) => (
                    <div
                      key={image.id}
                      className={styles.imageCard}
                      onMouseEnter={() => setHoveredRowId(image.id)}
                      onMouseLeave={() => {
                        setHoveredRowId(null);
                        if (hoveredInfoId !== image.id) {
                          setHoveredInfoId(null);
                          setTooltipPosition(null);
                          setTooltipData(null);
                        }
                      }}
                    >
                      <div className={styles.imageCardWrapper}>
                        <img
                          src={image.imageUrl}
                          alt={image.name || 'Image'}
                          className={styles.imagePreview}
                          onClick={() => {
                            setSelectedImage({
                              url: image.imageUrl,
                              name: image.name,
                              sourceUrl: image.sourceUrl,
                              id: image.id,
                              createdAt: image.createdAt
                            });
                            setIsImageModalOpen(true);
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* Source icon on top right */}
                        {image.sourceUrl && (
                          <a
                            href={image.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.imageCardSourceIcon}
                            title={image.sourceUrl}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiExternalLink />
                          </a>
                        )}
                        {/* Info icon on top left (shown on hover) */}
                        <div
                          ref={(el) => {
                            if (el) {
                              infoIconRefs.current[image.id] = el;
                            }
                          }}
                          className={`${styles.imageCardInfoIcon} ${hoveredRowId === image.id ? styles.infoIconVisible : styles.infoIconHidden}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInfoIconClick(image.id, formatDate(image.createdAt), image.sourceUrl || 'No source', e);
                          }}
                        >
                          <FiInfo className={styles.infoIcon} />
                        </div>
                      </div>
                      {image.name && (
                        <div className={styles.imageCardName}>{image.name}</div>
                      )}
                    </div>
                  ))}
                </div>
                {imagesLoadingMore && (
                  <div className={styles.loadingMore}>Loading more...</div>
                )}
              </>
            )}
            {/* Image Modal */}
            {isImageModalOpen && selectedImage && (
              <div 
                className={`${styles.imageModalOverlay} ${isImageModalClosing ? styles.imageModalOverlayClosing : ''}`}
                onClick={handleCloseImageModal}
              >
                <div 
                  className={`${styles.imageModal} ${isImageModalClosing ? styles.imageModalClosing : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.imageModalHeader}>
                    <div className={styles.imageModalTitle}>
                      {selectedImage.name || ''}
                    </div>
                    <div className={styles.imageModalIcons}>
                      {selectedImage.sourceUrl && (
                        <a
                          href={selectedImage.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.imageModalSource}
                          title={selectedImage.sourceUrl}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink />
                        </a>
                      )}
                      {selectedImage.id && (
                        <div
                          className={styles.imageModalInfoIcon}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedImage.id) {
                              const target = e.currentTarget as HTMLElement;
                              if (target) {
                                const rect = target.getBoundingClientRect();
                                setTooltipPosition({
                                  top: rect.top - 20,
                                  left: rect.left + rect.width / 2
                                });
                                setTooltipData({ 
                                  bookmarkTime: selectedImage.createdAt ? formatDate(selectedImage.createdAt) : 'N/A', 
                                  source: selectedImage.sourceUrl || 'No source' 
                                });
                                setHoveredInfoId(selectedImage.id);
                              }
                            }
                          }}
                        >
                          <FiInfo className={styles.infoIcon} />
                        </div>
                      )}
                      <button
                        className={styles.imageModalClose}
                        onClick={handleCloseImageModal}
                        aria-label="Close"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                  <div className={styles.imageModalContent}>
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.name || 'Image'}
                      className={styles.imageModalImage}
                    />
                  </div>
                </div>
          </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const getRefreshHandler = (tab: string) => {
    switch (tab) {
      case 'paragraph': return handleRefreshParagraphs;
      case 'link': return handleRefreshLinks;
      case 'word': return handleRefreshWords;
      case 'image': return handleRefreshImages;
      default: return () => {};
    }
  };

  const isLoading = (tab: string) => {
    switch (tab) {
      case 'paragraph': return paragraphsLoading;
      case 'link': return linksLoading;
      case 'word': return wordsLoading;
      case 'image': return imagesLoading;
      default: return false;
    }
  };

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
            <div className={styles.tabWrapper}>
              <button
                className={`${styles.tab} ${activeTab === 'paragraph' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('paragraph')}
              >
                <span>Paragraphs</span>
                {activeTab === 'paragraph' && (
              <button
                className={styles.refreshButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      getRefreshHandler('paragraph')();
                    }}
                disabled={isLoading('paragraph') || refreshingTab === 'paragraph'}
                title="Refresh paragraphs"
              >
                <FiRefreshCw className={refreshingTab === 'paragraph' ? styles.spin : ''} />
                  </button>
                )}
              </button>
            </div>
            <div className={styles.tabWrapper}>
              <button
                className={`${styles.tab} ${activeTab === 'link' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('link')}
              >
                <span>Links</span>
                {activeTab === 'link' && (
              <button
                className={styles.refreshButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      getRefreshHandler('link')();
                    }}
                disabled={isLoading('link') || refreshingTab === 'link'}
                title="Refresh links"
              >
                <FiRefreshCw className={refreshingTab === 'link' ? styles.spin : ''} />
                  </button>
                )}
              </button>
            </div>
            <div className={styles.tabWrapper}>
              <button
                className={`${styles.tab} ${activeTab === 'word' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('word')}
              >
                <span>Words</span>
                {activeTab === 'word' && (
              <button
                className={styles.refreshButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      getRefreshHandler('word')();
                    }}
                disabled={isLoading('word') || refreshingTab === 'word'}
                title="Refresh words"
              >
                <FiRefreshCw className={refreshingTab === 'word' ? styles.spin : ''} />
                  </button>
                )}
              </button>
            </div>
            <div className={styles.tabWrapper}>
              <button
                className={`${styles.tab} ${activeTab === 'image' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('image')}
              >
                <span>Images</span>
                {activeTab === 'image' && (
              <button
                className={styles.refreshButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      getRefreshHandler('image')();
                    }}
                disabled={isLoading('image') || refreshingTab === 'image'}
                title="Refresh images"
              >
                <FiRefreshCw className={refreshingTab === 'image' ? styles.spin : ''} />
                  </button>
                )}
              </button>
            </div>
          </div>
          <div className={styles.tabContent}>
            {renderTabContent()}
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Tooltip */}
      {hoveredInfoId && tooltipPosition && tooltipData && (
        <div
          className={styles.tooltip}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Prevent closing when clicking on tooltip itself
          }}
        >
          <div>Bookmark time: {tooltipData.bookmarkTime}</div>
          <div>Source: {tooltipData.source}</div>
        </div>
      )}
    </div>
  );
};

FolderBookmark.displayName = 'FolderBookmark';
