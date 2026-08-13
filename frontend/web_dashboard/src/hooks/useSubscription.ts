import { useState, useEffect } from 'react';
import { subscriptionApi, UpgradePayload } from '../services/api/subscriptionApi';
import { Subscription, SubscriptionTier } from '../pages/Subscription/types';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب البيانات مع وضع خيار الاحتياط في حال عدم وجود backend متصل حالياً
        const [subData, tiersData] = await Promise.all([
          subscriptionApi.fetchCurrentSubscription().catch(() => ({
            tier: 'free',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })),
          subscriptionApi.fetchAvailableTiers().catch(() => [
            {
              id: 'free',
              name: 'المجانية (FREE)',
              priceMonthly: 0,
              priceYearly: 0,
              features: ['توصيات محدودة', 'تحديثات يومية', 'دعم عبر البريد'],
            },
            {
              id: 'pro',
              name: 'المتقدمة (PRO)',
              priceMonthly: 29,
              priceYearly: 290,
              features: ['جميع التوصيات اللحظية', 'مؤشرات فنية متقدمة', 'تنبيهات فورية'],
            },
            {
              id: 'premium',
              name: 'احترافية (PREMIUM)',
              priceMonthly: 79,
              priceYearly: 790,
              features: ['التنفيذ التلقائي عبر API', 'توصيات الذكاء الاصطناعي', 'دعم خاص 24/7'],
            },
          ]),
        ]);

        setSubscription(subData);
        setAvailableTiers(tiersData);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تحميل بيانات الاشتراك');
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();
  }, []);

  const upgradeSubscription = async (tierId: string, payload: UpgradePayload) => {
    try {
      setIsUpgrading(true);
      setError(null);
      const updatedSub = await subscriptionApi.upgradeTier(tierId, payload);
      setSubscription(updatedSub);
    } catch (err: any) {
      setError(err.message || 'تعذر إتمام عملية الترقية');
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
