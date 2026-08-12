import { UserSubscription, SubscriptionTier, UpgradeRequest, UpgradeResponse } from '../../pages/Subscription/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ai-alshehri-backend.onrender.com/api/v1';

const MOCK_DATA = {
  subscription: {
    userId: 1,
    tier: 'free',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    executionEnabled: false,
    brokerConnected: false,
  },
  tiers: [
    {
      id: 'free' as const,
      name: 'مجاني',
      nameEn: 'Free',
      price: 0,
      priceYearly: 0,
      description: 'مثالي للبدء',
      features: {
        aiRecommendations: true,
        maxSymbols: 3,
        updateInterval: 'daily' as const,
        sentimentAnalysis: false,
        lstmModel: false,
        transformerModel: false,
        advancedCharts: false,
        pushNotifications: false,
        autoExecution: false,
        customStrategies: false,
        prioritySupport: false,
      },
      color: 'gray' as const,
      popular: false,
      highlight: false,
      badge: null,
    },
    {
      id: 'basic' as const,
      name: 'أساسي',
      nameEn: 'Basic',
      price: 29,
      priceYearly: 290,
      description: 'للمتداولين الجادين',
      features: {
        aiRecommendations: true,
        maxSymbols: 10,
        updateInterval: 'hourly' as const,
        sentimentAnalysis: false,
        lstmModel: false,
        transformerModel: false,
        advancedCharts: true,
        pushNotifications: false,
        autoExecution: false,
        customStrategies: false,
        prioritySupport: false,
      },
      color: 'blue' as const,
      popular: true,
      highlight: false,
      badge: 'الأكثر طلباً',
    },
    {
      id: 'pro' as const,
      name: 'احترافي',
      nameEn: 'Pro',
      price: 99,
      priceYearly: 990,
      description: 'للمحترفين',
      features: {
        aiRecommendations: true,
        maxSymbols: 50,
        updateInterval: 'realtime' as const,
        sentimentAnalysis: true,
        lstmModel: true,
        transformerModel: false,
        advancedCharts: true,
        pushNotifications: true,
        autoExecution: false,
        customStrategies: false,
        prioritySupport: false,
      },
      color: 'purple' as const,
      popular: false,
      highlight: false,
      badge: null,
    },
    {
      id: 'premium' as const,
      name: 'مميز',
      nameEn: 'Premium',
      price: 299,
      priceYearly: 2990,
      description: 'كل ما تحتاجه',
      features: {
        aiRecommendations: true,
        maxSymbols: -1,
        updateInterval: 'realtime' as const,
        sentimentAnalysis: true,
        lstmModel: true,
        transformerModel: true,
        advancedCharts: true,
        pushNotifications: true,
        autoExecution: true,
        customStrategies: true,
        prioritySupport: true,
      },
      color: 'gold' as const,
      popular: false,
      highlight: true,
      badge: '👑 الأفضل',
      specialNote: 'يتطلب إضافة مفاتيح API الخاصة بك',
    },
  ],
};

export class SubscriptionApiService {
  async getCurrentSubscription(): Promise<UserSubscription> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DATA.subscription as UserSubscription;
  }

  async getAvailableTiers(): Promise<SubscriptionTier[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DATA.tiers as SubscriptionTier[];
  }

  async upgrade(request: UpgradeRequest): Promise<UpgradeResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: `تمت الترقية إلى ${request.tierId} بنجاح`,
      subscription: {
        ...MOCK_DATA.subscription,
        tier: request.tierId,
        executionEnabled: request.tierId === 'premium',
      } as UserSubscription,
    };
  }
}

export const subscriptionApi = new SubscriptionApiService();
export default subscriptionApi;
