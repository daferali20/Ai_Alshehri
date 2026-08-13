// تعريف واجهة تفاصيل الوسيط للترقية إلى PREMIUM
export interface BrokerData {
  brokerType: string;
  apiKey: string;
  apiSecret: string;
}

// تعريف الخيارات عند طلب الترقية
export interface UpgradePayload {
  billingCycle: 'monthly' | 'yearly';
  termsAccepted?: boolean;
  consentSignature?: string;
  brokerData?: BrokerData;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

export const subscriptionApi = {
  // جلب بيانات الاشتراك الحالي للمستخدم
  fetchCurrentSubscription: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/current`);
    if (!response.ok) {
      throw new Error('فشل في جلب بيانات الاشتراك الحالي');
    }
    return response.json();
  },

  // جلب الخطط المتاحة
  fetchAvailableTiers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/tiers`);
    if (!response.ok) {
      throw new Error('فشل في جلب خطط الأسعار');
    }
    return response.json();
  },

  // طلب ترقية الاشتراك
  upgradeTier: async (tierId: string, payload: UpgradePayload) => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tierId, ...payload }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'حدث خطأ أثناء معالجة طلب الترقية');
    }

    return response.json();
  },
};
