import { useState, useEffect } from 'react';
import { UserSubscription, SubscriptionTier } from '../pages/Subscription/types';

const MOCK_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'المجانية (FREE)',
    nameEn: 'Free',
    price: 0,
    priceYearly: 0,
    description: 'للمبتدئين لاستكشاف التحليلات',
    color: 'gray',
    popular: false,
    highlight: false,
    badge: null,
    features: {
      aiRecommendations: false,
      maxSymbols: 3,
      updateInterval: 'daily',
      sentimentAnalysis: false,
      lstmModel: false,
      transformerModel: false,
      advancedCharts: false,
      pushNotifications: false,
      autoExecution: false,
      customStrategies: false,
      prioritySupport: false,
    },
  },
  {
    id: 'pro',
    name: 'المتقدمة (PRO)',
    nameEn: 'Pro',
    price: 29,
    priceYearly: 290,
    description: 'للمتداولين النشطين للحصول على توصيات لحظية',
    color: 'blue',
    popular: true,
    highlight: true,
    badge: 'الأكثر شعبية',
    features: {
      aiRecommendations: true,
      maxSymbols: 20,
      updateInterval: 'hourly',
      sentimentAnalysis: true,
      lstmModel: true,
      transformerModel: false,
      advancedCharts: true,
      pushNotifications: true,
      autoExecution: false,
      customStrategies: false,
      prioritySupport: false,
    },
  },
  {
    id: 'premium',
    name: 'احترافية (PREMIUM)',
    nameEn: 'Premium',
    price: 79,
    priceYearly: 790,
    description: 'دعم كامل للتنفيذ التلقائي عبر API وأحدث نماذج الذكاء الاصطناعي',
    color: 'gold',
    popular: false,
    highlight: true,
    badge: 'التنفيذ التلقائي',
    specialNote: 'يتطلب ربط مفاتيح API الخاصة بالوسيط',
    features: {
      aiRecommendations: true,
      maxSymbols: 100,
      updateInterval: 'realtime',
      sentimentAnalysis: true,
      lstmModel: true,
      transformerModel: true,
      advancedCharts: true,
      pushNotifications: true,
      autoExecution: true,
      customStrategies: true,
      prioritySupport: true,
    },
  },
];

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubscription({
        userId: 1,
        tier: 'free',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        executionEnabled: false,
        brokerConnected: false,
      });
      setAvailableTiers(MOCK_TIERS);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const upgradeSubscription = async (tierId: string, payload: any) => {
    setIsUpgrading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              tier: tierId,
              executionEnabled: tierId === 'premium',
            }
          : null
      );
    } catch (err: any) {
      setError('فشلت عملية الترقية، يرجى المحاولة لاحقاً');
    } finally {
      setIsUpgrading(false);
    }
  };

  return {
    subscription,
    availableTiers,
    loading,
    error,
    isUpgrading,
    upgradeSubscription,
  };
};
