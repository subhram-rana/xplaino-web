/**
 * usePaddle Hook
 * 
 * React hook for Paddle.js integration.
 * Provides price fetching and checkout functionality with monthly/yearly pricing support.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Paddle } from '@paddle/paddle-js';
import { 
  initPaddle, 
  openCheckoutForPrice 
} from '@/shared/services/paddle.service';
import { paddleConfig } from '@/shared/config/paddle.config';
import type { 
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
  /** Monthly formatted prices (Pro, Ultra) */
  monthlyPrices: FormattedPaddlePrice[];
  /** Yearly formatted prices (Pro, Ultra) */
  yearlyPrices: FormattedPaddlePrice[];
  /** Open checkout for a specific price */
  openCheckout: (
    priceId: string, 
    discountId?: string,
    settings?: PaddleCheckoutSettings,
    customer?: PaddleCheckoutCustomer
  ) => Promise<void>;
  /** Refresh prices */
  refreshPrices: () => Promise<void>;
}

interface UsePaddleOptions {
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
 * Fetch a single price with its discount
 */
const fetchSinglePrice = async (
  paddle: Paddle,
  priceId: string,
  discountId?: string
): Promise<FormattedPaddlePrice | null> => {
  if (!priceId) return null;

  try {
    const pricePreviewResult = await paddle.PricePreview({
      items: [{ priceId, quantity: 1 }],
      ...(discountId && { discountId }),
    });

    const data = pricePreviewResult?.data as PaddlePricePreviewData | undefined;

    if (data?.details?.lineItems && data.details.lineItems.length > 0) {
      const item = data.details.lineItems[0];
      const price = item.price;
      const product = item.product;
      const currencyCode = data.currencyCode;

      // Parse amounts from totals (in smallest currency unit)
      // Using subtotal (before tax) for display
      const subtotalInSmallestUnit = parseInt(item.totals.subtotal, 10);
      const discountInSmallestUnit = parseInt(item.totals.discount, 10);

      const originalAmount = subtotalInSmallestUnit / 100;
      const discountAmount = discountInSmallestUnit / 100;
      // Final amount is subtotal minus discount (excluding tax/GST)
      const finalAmount = (subtotalInSmallestUnit - discountInSmallestUnit) / 100;

      // Check if discount is applied
      const hasDiscount = discountAmount > 0;

      // Calculate discount percentage
      const discountPercentage = hasDiscount && originalAmount > 0
        ? Math.round((discountAmount / originalAmount) * 100)
        : null;

      const billingInterval = price.billingCycle?.interval || 'month';
      const billingFrequency = price.billingCycle?.frequency || 1;

      // Format price without tax - use subtotal for display
      // If discount applied, manually format the discounted price
      const currencySymbol = getCurrencySymbol(currencyCode);
      const formattedFinalPrice = hasDiscount 
        ? `${currencySymbol}${Math.floor(finalAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : `${currencySymbol}${Math.floor(parseFloat(item.totals.subtotal) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

      // Calculate monthly equivalents for yearly pricing
      const isYearly = billingInterval === 'year';
      const monthlyEquivalent = isYearly ? Math.floor(finalAmount / 12) : null;
      const originalMonthlyEquivalent = isYearly ? Math.floor(originalAmount / 12) : null;
      const formattedMonthlyEquivalent = isYearly 
        ? `${currencySymbol}${Math.floor(finalAmount / 12).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : null;
      const formattedOriginalMonthlyEquivalent = isYearly 
        ? `${currencySymbol}${Math.floor(originalAmount / 12).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : null;

      return {
        id: price.id,
        name: price.name || product?.name || 'Unnamed Plan',
        description: price.description || product?.description || '',
        amount: finalAmount,
        currencyCode,
        currencySymbol,
        billingInterval,
        billingFrequency,
        formattedPrice: formattedFinalPrice,
        formattedBillingCycle: formatBillingCycle(billingInterval, billingFrequency),
        product: product ? {
          id: product.id,
          name: product.name,
          description: product.description || '',
          imageUrl: product.imageUrl,
        } : null,
        hasDiscount,
        originalAmount: hasDiscount ? originalAmount : null,
        discountAmount: hasDiscount ? discountAmount : null,
        discountPercentage,
        formattedOriginalPrice: hasDiscount ? `${currencySymbol}${Math.floor(originalAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null,
        // Monthly equivalent fields for yearly pricing
        monthlyEquivalent,
        formattedMonthlyEquivalent,
        originalMonthlyEquivalent,
        formattedOriginalMonthlyEquivalent,
      };
    }
  } catch (err) {
    console.error(`Failed to fetch price ${priceId}:`, err);
  }

  return null;
};

/**
 * Hook for Paddle.js integration with monthly/yearly pricing
 */
export const usePaddle = (options: UsePaddleOptions = {}): UsePaddleReturn => {
  const { autoFetch = true } = options;
  
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyPrices, setMonthlyPrices] = useState<FormattedPaddlePrice[]>([]);
  const [yearlyPrices, setYearlyPrices] = useState<FormattedPaddlePrice[]>([]);

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

  // Fetch all prices (monthly and yearly)
  const fetchPrices = useCallback(async () => {
    if (!paddle) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { priceIds, discountIds } = paddleConfig;

      // Fetch all 4 prices in parallel, each with its specific discount
      const [proMonthly, ultraMonthly, proYearly, ultraYearly] = await Promise.all([
        fetchSinglePrice(paddle, priceIds.monthly.pro, discountIds.monthly.pro),
        fetchSinglePrice(paddle, priceIds.monthly.ultra, discountIds.monthly.ultra),
        fetchSinglePrice(paddle, priceIds.yearly.pro, discountIds.yearly.pro),
        fetchSinglePrice(paddle, priceIds.yearly.ultra, discountIds.yearly.ultra),
      ]);

      // Build monthly prices array (filter out nulls)
      const monthly: FormattedPaddlePrice[] = [];
      if (proMonthly) monthly.push(proMonthly);
      if (ultraMonthly) monthly.push(ultraMonthly);

      // Build yearly prices array (filter out nulls)
      const yearly: FormattedPaddlePrice[] = [];
      if (proYearly) yearly.push(proYearly);
      if (ultraYearly) yearly.push(ultraYearly);

      // Sort by amount (ascending)
      monthly.sort((a, b) => a.amount - b.amount);
      yearly.sort((a, b) => a.amount - b.amount);

      setMonthlyPrices(monthly);
      setYearlyPrices(yearly);

      if (monthly.length === 0 && yearly.length === 0) {
        // No prices configured - this is OK for free tier
        console.log('No paid prices configured');
      }
    } catch (err) {
      console.error('Failed to fetch prices:', err);
      setError('Failed to load pricing. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [paddle]);

  // Auto-fetch prices when paddle is initialized
  useEffect(() => {
    if (isInitialized && autoFetch) {
      fetchPrices();
    }
  }, [isInitialized, autoFetch, fetchPrices]);

  // Open checkout handler
  const handleOpenCheckout = useCallback(async (
    priceId: string,
    discountId?: string,
    settings?: PaddleCheckoutSettings,
    customer?: PaddleCheckoutCustomer
  ) => {
    try {
      await openCheckoutForPrice(priceId, 1, settings, customer, discountId);
    } catch (err) {
      console.error('Checkout error:', err);
      throw err;
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    monthlyPrices,
    yearlyPrices,
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
