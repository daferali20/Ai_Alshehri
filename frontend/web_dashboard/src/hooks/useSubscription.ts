// frontend/web_dashboard/src/hooks/useSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  UserSubscription, 
  SubscriptionTier, 
  UpgradeRequest, 
  UpgradeResponse,
  SubscriptionError,
  SubscriptionErrorCodes 
} from '../pages/Subscription/types';
import { subscriptionApi } from '../services/api/subscriptionApi';

/**
 * Hook مخصص لإدارة الاشتراكات
 * يوفر وظائف لجلب البيانات، الترقية، الإلغاء، وإدارة الحالة
 */
export const useSubscription = () => {
  // ============================================
  // State Management
  // ============================================
  
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);

  // ============================================
  // Fetch Functions
  // ============================================
  
  /**
   * جلب اشتراك المستخدم الحالي
   */
  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await subscriptionApi.getCurrentSubscription();
      setSubscription(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في جلب بيانات الاشتراك';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * جلب جميع الخطط المتاحة
   */
  const fetchAvailableTiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await subscriptionApi.getAvailableTiers();
      setAvailableTiers(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في جلب خطط الاشتراك';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * جلب جميع البيانات (الاشتراك الحالي + الخطط المتاحة)
   */
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [subscriptionData, tiersData] = await Promise.all([
        subscriptionApi.getCurrentSubscription(),
        subscriptionApi.getAvailableTiers()
      ]);
      
      setSubscription(subscriptionData);
      setAvailableTiers(tiersData);
      
      return { subscription: subscriptionData, tiers: tiersData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في جلب البيانات';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Subscription Actions
  // ============================================
  
  /**
   * ترقية الاشتراك إلى خطة أعلى
   */
  const upgradeSubscription = useCallback(async (
    tierId: string, 
    data?: Partial<UpgradeRequest>
  ): Promise<UpgradeResponse> => {
    setIsUpgrading(true);
    setError(null);
    
    try {
      const requestData: UpgradeRequest = {
        tierId,
        billingCycle: data?.billingCycle || 'monthly',
        termsAccepted: data?.termsAccepted || false,
        consentSignature: data?.consentSignature,
        brokerData: data?.brokerData,
        paymentMethodId: data?.paymentMethodId
      };
      
      const response = await subscriptionApi.upgrade(requestData);
      
      // تحديث الاشتراك بعد الترقية
      if (response.success && response.subscription) {
        setSubscription(response.subscription);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في ترقية الاشتراك';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpgrading(false);
    }
  }, []);

  /**
   * إلغاء الاشتراك الحالي
   */
  const cancelSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await subscriptionApi.cancel();
      
      // تحديث الاشتراك بعد الإلغاء
      if (response.subscription) {
        setSubscription(response.subscription);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إلغاء الاشتراك';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * إضافة مفاتيح API للوسيط (للمشتركين PREMIUM)
   */
  const addBrokerAPI = useCallback(async (
    brokerType: string,
    apiKey: string,
    apiSecret: string,
    consentSignature: string
  ) => {
    setIsUpgrading(true);
    setError(null);
    
    try {
      const response = await subscriptionApi.addBrokerAPI({
        brokerType,
        apiKey,
        apiSecret,
        consentSignature,
        isPaperTrading: true // يمكن جعلها اختيارية
      });
      
      // تحديث الاشتراك بعد إضافة الـ API
      if (response.subscription) {
        setSubscription(response.subscription);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إضافة مفاتيح API';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpgrading(false);
    }
  }, []);

  /**
   * إزالة مفاتيح API للوسيط
   */
  const removeBrokerAPI = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await subscriptionApi.removeBrokerAPI();
      
      if (response.subscription) {
        setSubscription(response.subscription);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إزالة مفاتيح API';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * التحقق من صلاحية الاشتراك
   */
  const checkSubscriptionValidity = useCallback(async (): Promise<boolean> => {
    try {
      const isValid = await subscriptionApi.checkValidity();
      return isValid;
    } catch (err) {
      console.error('Error checking subscription validity:', err);
      return false;
    }
  }, []);

  /**
   * الحصول على ميزات الخطة الحالية
   */
  const getCurrentFeatures = useCallback(() => {
    if (!subscription) return null;
    
    const tier = availableTiers.find(t => t.id === subscription.tier);
    return tier?.features || null;
  }, [subscription, availableTiers]);

  /**
   * التحقق من توفر ميزة معينة
   */
  const hasFeature = useCallback((featureKey: string): boolean => {
    const features = getCurrentFeatures();
    if (!features) return false;
    
    return features[featureKey as keyof typeof features] === true;
  }, [getCurrentFeatures]);

  /**
   * التحقق من إمكانية تنفيذ الأوامر
   */
  const canExecuteTrades = useCallback((): boolean => {
    if (!subscription) return false;
    
    return (
      subscription.tier === 'premium' &&
      subscription.executionEnabled === true &&
      subscription.brokerConnected === true &&
      subscription.isActive === true
    );
  }, [subscription]);

  /**
   * الحصول على عدد الأسهم المتبقية
   */
  const getRemainingSymbols = useCallback((): number => {
    if (!subscription) return 0;
    
    const tier = availableTiers.find(t => t.id === subscription.tier);
    if (!tier) return 0;
    
    const maxSymbols = tier.features.maxSymbols;
    if (maxSymbols === -1) return -1; // غير محدود
    
    const used = subscription.remainingSymbols || 0;
    return Math.max(0, maxSymbols - used);
  }, [subscription, availableTiers]);

  // ============================================
  // Effects
  // ============================================
  
  // تحميل البيانات تلقائياً عند تحميل المكون
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // التحقق الدوري من صلاحية الاشتراك (كل 5 دقائق)
  useEffect(() => {
    const interval = setInterval(() => {
      checkSubscriptionValidity();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkSubscriptionValidity]);

  // ============================================
  // Return
  // ============================================
  
  return {
    // البيانات
    subscription,
    availableTiers,
    loading,
    error,
    isUpgrading,
    
    // دوال جلب البيانات
    fetchSubscription,
    fetchAvailableTiers,
    fetchAllData,
    
    // دوال الإجراءات
    upgradeSubscription,
    cancelSubscription,
    addBrokerAPI,
    removeBrokerAPI,
    checkSubscriptionValidity,
    
    // دوال المساعدة
    getCurrentFeatures,
    hasFeature,
    canExecuteTrades,
    getRemainingSymbols,
    
    // دوال إعادة تعيين
    resetError: () => setError(null),
  };
};

export default useSubscription;
