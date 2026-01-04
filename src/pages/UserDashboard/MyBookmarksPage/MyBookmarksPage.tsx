import React from 'react';
import { UserDashboard } from '../UserDashboard';

/**
 * MyBookmarksPage - My Bookmarks page
 * Rendered inside UserDashboardLayout via Outlet
 * 
 * @returns JSX element
 */
export const MyBookmarksPage: React.FC = () => {
  return <UserDashboard />;
};

MyBookmarksPage.displayName = 'MyBookmarksPage';

