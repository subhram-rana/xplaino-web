/**
 * usePaddle Hook
 * 
 * React hook for Paddle.js integration.
 * Provides price fetching and checkout functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Paddle } from '@paddle/paddle-js';
import { 
  initPaddle, 
  openCheckoutForPrice 
} from '@/shared/services/paddle.service';
import { paddleConfig } from '@/shared/config/paddle.config';
import type { 
  PaddlePrice, 
  FormattedPaddlePrice,
  PaddleCheckoutSettings,
  PaddleCheckoutCustomer 
} from '@/shared/types/paddle.types';

interface UsePaddleReturn {
  /** Whether Paddle is initialized */
  isInitialized: boolean;
  /** Whether prices are loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Formatted prices for display */
  prices: FormattedPaddlePrice[];
  /** Raw Paddle prices */
  rawPrices: PaddlePrice[];
  /** Open checkout for a specific price */
  openCheckout: (
    priceId: string, 
    settings?: PaddleCheckoutSettings,
    customer?: PaddleCheckoutCustomer
  ) => Promise<void>;
  /** Refresh prices */
  refreshPrices: () => Promise<void>;
}

interface UsePaddleOptions {
  /** Price IDs to fetch (optional, fetches all if not provided) */
  priceIds?: string[];
  /** Auto-fetch prices on mount */
  autoFetch?: boolean;
}

// Paddle.js SDK returns camelCase (it transforms the snake_case API response)
interface PaddleLineItem {
  price: {
    id: string;
    name: string | null;
    description: string | null;
    billingCycle: {
      interval: string;
      frequency: number;
    } | null;
    unitPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  product: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
  formattedTotals: {
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
  };
  totals: {
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
  };
}

interface PaddlePricePreviewData {
  currencyCode: string;
  details: {
    lineItems: PaddleLineItem[];
  };
}

/**
 * Hook for Paddle.js integration
 */
export const usePaddle = (options: UsePaddleOptions = {}): UsePaddleReturn => {
  const { priceIds, autoFetch = true } = options;
  
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<FormattedPaddlePrice[]>([]);
  const [rawPrices, setRawPrices] = useState<PaddlePrice[]>([]);

  // Initialize Paddle
  useEffect(() => {
    const init = async () => {
      try {
        const paddleInstance = await initPaddle();
        setPaddle(paddleInstance);
        setIsInitialized(!!paddleInstance);
        
        if (!paddleInstance) {
          setError('Failed to initialize payment system');
        }
      } catch (err) {
        console.error('Paddle initialization error:', err);
        setError('Failed to initialize payment system');
      }
    };

    init();
  }, []);

  // Fetch prices using PricePreview
  const fetchPrices = useCallback(async () => {
    if (!paddle) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get price IDs to fetch
      const idsToFetch = priceIds || Object.values(paddleConfig.priceIds);
      
      if (idsToFetch.length === 0) {
        setPrices([]);
        setRawPrices([]);
        setIsLoading(false);
        return;
      }

      // Use Paddle PricePreview to get localized prices
      const pricePreviewResult = await paddle.PricePreview({
        items: idsToFetch.map(id => ({ priceId: id, quantity: 1 })),
      });

      // Paddle.js SDK returns camelCase data
      const data = pricePreviewResult?.data as PaddlePricePreviewData | undefined;

      if (data?.details?.lineItems && data.details.lineItems.length > 0) {
        const lineItems = data.details.lineItems;
        const currencyCode = data.currencyCode;

        // Map the preview results to our format
        const formattedPrices: FormattedPaddlePrice[] = lineItems.map(item => {
          const price = item.price;
          const product = item.product; // product is sibling of price, not nested
          
          // Parse the amount from totals (in smallest currency unit)
          const amountInSmallestUnit = parseInt(item.totals.subtotal, 10);
          const amount = amountInSmallestUnit / 100;
          
          const billingInterval = price.billingCycle?.interval || 'month';
          const billingFrequency = price.billingCycle?.frequency || 1;

          return {
            id: price.id,
            name: price.name || product?.name || 'Unnamed Plan',
            description: price.description || product?.description || '',
            amount,
            currencyCode,
            currencySymbol: getCurrencySymbol(currencyCode),
            billingInterval,
            billingFrequency,
            // Use Paddle's pre-formatted price (includes local currency symbol)
            formattedPrice: item.formattedTotals.subtotal,
            formattedBillingCycle: formatBillingCycle(billingInterval, billingFrequency),
            product: product ? {
              id: product.id,
              name: product.name,
              description: product.description || '',
              imageUrl: product.imageUrl,
            } : null,
          };
        });

        // Sort by amount (ascending)
        formattedPrices.sort((a, b) => a.amount - b.amount);

        setPrices(formattedPrices);
        
        // Store raw prices for reference
        setRawPrices(lineItems.map(item => item.price as unknown as PaddlePrice));
      } else {
        console.error('Unexpected Paddle response structure:', pricePreviewResult);
        setError('Failed to load pricing. Please refresh the page.');
      }
    } catch (err) {
      console.error('Failed to fetch prices:', err);
      setError('Failed to load pricing. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [paddle, priceIds]);

  // Auto-fetch prices when paddle is initialized
  useEffect(() => {
    if (isInitialized && autoFetch) {
      fetchPrices();
    }
  }, [isInitialized, autoFetch, fetchPrices]);

  // Open checkout handler
  const handleOpenCheckout = useCallback(async (
    priceId: string,
    settings?: PaddleCheckoutSettings,
    customer?: PaddleCheckoutCustomer
  ) => {
    try {
      await openCheckoutForPrice(priceId, 1, settings, customer);
    } catch (err) {
      console.error('Checkout error:', err);
      throw err;
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    prices,
    rawPrices,
    openCheckout: handleOpenCheckout,
    refreshPrices: fetchPrices,
  };
};

// Helper functions
const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
  };
  return symbols[currencyCode] || currencyCode;
};

const formatBillingCycle = (interval: string, frequency: number): string => {
  if (frequency === 1) {
    return `per ${interval}`;
  }
  return `every ${frequency} ${interval}s`;
};

export default usePaddle;
