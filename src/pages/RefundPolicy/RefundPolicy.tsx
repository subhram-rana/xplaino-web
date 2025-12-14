import React from 'react';
import styles from './RefundPolicy.module.css';

/**
 * RefundPolicy - Refund Policy page component
 * 
 * @returns JSX element
 */
export const RefundPolicy: React.FC = () => {
  return (
    <div className={styles.refundPolicy}>
      <h1>Refund Policy</h1>
      <p>Refund Policy content - Coming soon</p>
    </div>
  );
};

RefundPolicy.displayName = 'RefundPolicy';

