// src/hooks/useSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { UserSubscription, SubscriptionTier, UpgradeRequest } from '../pages/Subscription/types';
import { subscriptionApi } from '../services/api/subscriptionApi';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subData, tiersData] = await Promise.all([
        subscriptionApi.getCurrentSubscription(),
        subscriptionApi.getAvailableTiers(),
      ]);
      setSubscription(subData);
      setAvailableTiers(tiersData);
    } catch (err: any) {
      setError(err.message || 'فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  const upgradeSubscription = useCallback(async (tierId: string, data?: Partial<UpgradeRequest>) => {
    setIsUpgrading(true);
    setError(null);
    try {
      const response = await subscriptionApi.upgrade({
        tierId,
        billingCycle: data?.billingCycle || 'monthly',
        termsAccepted: data?.termsAccepted || false,
        consentSignature: data?.consentSignature,
        brokerData: data?.brokerData,
      });
      if (response.success && response.subscription) {
        setSubscription(response.subscription);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'فشل في الترقية');
      throw err;
    } finally {
      setIsUpgrading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    subscription,
    availableTiers,
    loading,
    error,
    isUpgrading,
    fetchAllData,
    upgradeSubscription,
    resetError: () => setError(null),
  };
};

export default useSubscription;
