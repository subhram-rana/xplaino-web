import React from 'react';
import styles from './PdfPage.module.css';

/**
 * PdfPage - PDF management page content (placeholder)
 * Rendered inside UserDashboardLayout via Outlet
 * 
 * @returns JSX element
 */
export const PdfPage: React.FC = () => {
  return (
    <div className={styles.pdfPage}>
      <div className={styles.comingSoon}>
        <h2>PDF functionality coming soon</h2>
        <p>This feature is under development and will be available shortly.</p>
      </div>
    </div>
  );
};

PdfPage.displayName = 'PdfPage';

