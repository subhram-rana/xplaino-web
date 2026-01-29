import React, { useState } from 'react';
import styles from './Pricing.module.css';
import { usePaddle } from '@/shared/hooks/usePaddle';
import type { FormattedPaddlePrice } from '@/shared/types/paddle.types';
import { Toast } from '@/shared/components/Toast';
import { ChromeButton } from '@/shared/components/ChromeButton';

/**
 * Pricing - Pricing page component displaying Paddle pricing plans
 * 
 * @returns JSX element
 */
export const Pricing: React.FC = () => {
  const { prices, isLoading, error, openCheckout } = usePaddle();
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleGetStarted = async (price: FormattedPaddlePrice) => {
    try {
      setCheckoutLoading(price.id);
      await openCheckout(price.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open checkout';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getButtonText = (price: FormattedPaddlePrice): string => {
    if (checkoutLoading === price.id) {
      return 'Loading...';
    }
    const name = price.name.toLowerCase();
    if (name.includes('enterprise')) {
      return 'Contact us';
    }
    if (price.amount === 0) {
      return 'Get started for free';
    }
    return 'Get started';
  };

  const getButtonClass = (index: number): string => {
    // Middle card or second card gets primary button style
    if (index === 1) {
      return styles.buttonPrimary;
    }
    return styles.buttonSecondary;
  };

  if (isLoading) {
    return (
      <div className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading pricing plans...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.loading}>{error}</div>
        </div>
      </div>
    );
  }

  if (prices.length === 0) {
    return (
      <div className={styles.pricingEmpty}>
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            <strong style={{ fontWeight: 800 }}>Free while in beta</strong>
            <br />
            <span style={{ fontSize: '0.85em', fontStyle: 'italic' }}>Join thousands of early adopters before pricing kicks in!</span>
          </p>
          <div className={styles.chromeButtonContainer}>
            <ChromeButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pricing}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Pricing</h1>

        <div className={styles.cards}>
          {prices.map((price, index) => {
            const isMiddleCard = index === 1;
            
            return (
              <div 
                key={price.id} 
                className={`${styles.card} ${isMiddleCard ? styles.cardMiddle : ''}`}
              >
                {/* Product Image */}
                {price.product?.imageUrl && (
                  <div className={styles.productImageContainer}>
                    <img 
                      src={price.product.imageUrl} 
                      alt={price.product.name}
                      className={styles.productImage}
                    />
                  </div>
                )}

                {/* Plan Name */}
                <div className={styles.cardTitleContainer}>
                  <h2 className={styles.cardTitle}>{price.name}</h2>
                </div>
                
                {/* Price Display */}
                <div className={styles.price}>
                  <div className={styles.priceContainer}>
                    <div className={styles.priceAmount}>
                      {price.formattedPrice}
                    </div>
                    <div className={styles.pricePeriod}>
                      {price.formattedBillingCycle}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className={styles.description}>{price.description}</p>

                {/* CTA Button */}
                <button 
                  className={getButtonClass(index)}
                  onClick={() => handleGetStarted(price)}
                  disabled={checkoutLoading === price.id}
                >
                  {getButtonText(price)}
                </button>

                {/* Product Info */}
                {price.product && (
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{price.product.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

Pricing.displayName = 'Pricing';
