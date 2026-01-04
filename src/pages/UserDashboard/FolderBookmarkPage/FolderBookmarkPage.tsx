import React from 'react';
import { FolderBookmark } from '../FolderBookmark';

/**
 * FolderBookmarkPage - Folder bookmark detail page
 * Rendered inside UserDashboardLayout via Outlet
 * 
 * @returns JSX element
 */
export const FolderBookmarkPage: React.FC = () => {
  return <FolderBookmark />;
};

FolderBookmarkPage.displayName = 'FolderBookmarkPage';

