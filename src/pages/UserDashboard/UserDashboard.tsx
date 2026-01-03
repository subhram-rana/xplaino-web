import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiList, FiGrid, FiArrowUp, FiArrowDown, FiPlus } from 'react-icons/fi';
import styles from './UserDashboard.module.css';
import { useAuth } from '@/shared/hooks/useAuth';
import { getAllFolders, createFolder } from '@/shared/services/folders.service';
import type { FolderWithSubFolders } from '@/shared/types/folders.types';
import { FolderIcon } from '@/shared/components/FolderIcon';
import { Toast } from '@/shared/components/Toast';
import { CreateFolderModal } from '@/shared/components/CreateFolderModal';

/**
 * UserDashboard - User dashboard with folder management
 * 
 * @returns JSX element
 */
export const UserDashboard: React.FC = () => {
  const { accessToken } = useAuth();
  const [folders, setFolders] = useState<FolderWithSubFolders[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Flatten hierarchical folder structure
  const flattenFolders = (folderList: FolderWithSubFolders[]): FolderWithSubFolders[] => {
    const result: FolderWithSubFolders[] = [];
    const traverse = (folder: FolderWithSubFolders) => {
      result.push(folder);
      if (folder.subFolders && folder.subFolders.length > 0) {
        folder.subFolders.forEach(traverse);
      }
    };
    folderList.forEach(traverse);
    return result;
  };

  const fetchFolders = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const response = await getAllFolders(accessToken);
      setFolders(response.folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load folders';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchFolders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleRefresh = () => {
    fetchFolders();
  };

  const handleSort = (field: 'created_at' | 'updated_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFolderClick = (folder: FolderWithSubFolders) => {
    navigate(`/user/dashboard/bookmark/${folder.id}`, {
      state: { folder: { id: folder.id, name: folder.name } }
    });
  };

  const handleCreateFolder = async (name: string) => {
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      await createFolder(accessToken, name);
      // Refresh folders list to show the newly created folder
      await fetchFolders();
      setToast({ message: 'Folder created successfully!', type: 'success' });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create folder';
      setToast({ message: errorMessage, type: 'error' });
      throw error; // Re-throw to let modal handle it
    }
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

  // Get flattened and sorted folders
  const flattenedFolders = flattenFolders(folders);
  const sortedFolders = [...flattenedFolders].sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = new Date(a[sortBy]).getTime();
    const bValue = new Date(b[sortBy]).getTime();
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <h2 className={styles.heading}>My bookmarks</h2>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewButtonActive : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <FiList />
              </button>
              <button
                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.viewButtonActive : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <FiGrid />
              </button>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.refreshButton}
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh folders"
            >
              <FiRefreshCw className={isLoading ? styles.spin : ''} />
            </button>
            <button
              className={styles.createFolderButton}
              onClick={() => setIsCreateModalOpen(true)}
              title="Create folder"
            >
              <FiPlus />
              <span>Create folder</span>
            </button>
          </div>
        </div>

        {isLoading && folders.length === 0 ? (
          <div className={styles.loading}>Loading folders...</div>
        ) : sortedFolders.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyHeading}>No folders yet</h2>
            <p className={styles.emptyMessage}>You haven't created any folders yet.</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className={styles.listView}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Folder Name</th>
                      <th>
                        <button
                          className={`${styles.sortButton} ${sortBy === 'created_at' ? styles.sortButtonActive : ''}`}
                          onClick={() => handleSort('created_at')}
                        >
                          Created At
                          <span className={styles.sortIcons}>
                            <FiArrowUp className={sortBy === 'created_at' && sortOrder === 'asc' ? styles.sortIconActive : styles.sortIconInactive} />
                            <FiArrowDown className={sortBy === 'created_at' && sortOrder === 'desc' ? styles.sortIconActive : styles.sortIconInactive} />
                          </span>
                        </button>
                      </th>
                      <th>
                        <button
                          className={`${styles.sortButton} ${sortBy === 'updated_at' ? styles.sortButtonActive : ''}`}
                          onClick={() => handleSort('updated_at')}
                        >
                          Updated At
                          <span className={styles.sortIcons}>
                            <FiArrowUp className={sortBy === 'updated_at' && sortOrder === 'asc' ? styles.sortIconActive : styles.sortIconInactive} />
                            <FiArrowDown className={sortBy === 'updated_at' && sortOrder === 'desc' ? styles.sortIconActive : styles.sortIconInactive} />
                          </span>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFolders.map((folder) => (
                      <tr
                        key={folder.id}
                        className={styles.tableRow}
                        onClick={() => handleFolderClick(folder)}
                      >
                        <td>
                          <div className={styles.folderNameCell}>
                            <FolderIcon size={20} />
                            <span>{folder.name}</span>
                          </div>
                        </td>
                        <td>{formatDate(folder.created_at)}</td>
                        <td>{formatDate(folder.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.gridView}>
                {sortedFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className={styles.folderCard}
                    onClick={() => handleFolderClick(folder)}
                  >
                    <FolderIcon size={32} />
                    <span className={styles.folderCardName}>{folder.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <CreateFolderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateFolder}
        />
      </div>
    </div>
  );
};

UserDashboard.displayName = 'UserDashboard';

