// frontend/web_dashboard/src/services/api/index.ts
import { subscriptionApi } from './subscriptionApi';
import { authApi } from './authApi';
import { tradingApi } from './tradingApi';

/**
 * تصدير جميع خدمات الـ API
 */
export {
  subscriptionApi,
  authApi,
  tradingApi,
};

/**
 * تصدير افتراضي لجميع الخدمات
 */
export default {
  subscription: subscriptionApi,
  auth: authApi,
  trading: tradingApi,
};
