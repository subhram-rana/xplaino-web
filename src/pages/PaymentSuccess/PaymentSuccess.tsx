import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './PaymentSuccess.module.css';

/**
 * PaymentSuccess - Page displayed after successful Paddle checkout
 * 
 * Paddle redirects here with query params like ?_ptxn=txn_01abc123...
 * 
 * @returns JSX element
 */
export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Paddle sends transaction ID as _ptxn parameter
  const transactionId = searchParams.get('_ptxn');

  const handleGoToDashboard = () => {
    navigate('/user/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Success Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.successIcon}>
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={styles.checkmark}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className={styles.title}>Payment Successful!</h1>
        <p className={styles.message}>
          Thank you for your purchase. Your subscription is now active.
        </p>

        {/* Transaction ID */}
        {transactionId && (
          <div className={styles.transactionInfo}>
            <span className={styles.transactionLabel}>Transaction ID:</span>
            <code className={styles.transactionId}>{transactionId}</code>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </button>
          <button 
            className={styles.secondaryButton}
            onClick={handleGoHome}
          >
            Back to Home
          </button>
        </div>

        {/* Help Text */}
        <p className={styles.helpText}>
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};

PaymentSuccess.displayName = 'PaymentSuccess';
