// src/services/api/subscriptionApi.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  UserSubscription, 
  SubscriptionTier, 
  UpgradeRequest, 
  UpgradeResponse,
} from '../../pages/Subscription/types';

/**
 * إعدادات الـ API
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ai-alshehri-backend.onrender.com/api/v1';
const API_TIMEOUT = 30000; // 30 ثانية

/**
 * كلاس خدمات الاشتراكات
 */
class SubscriptionApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor لإضافة الـ Token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor لمعالجة الأخطاء
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * تعيين Token المستخدم
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * جلب Token المخزن
   */
  private getToken(): string | null {
    if (this.token) return this.token;
    return localStorage.getItem('auth_token');
  }

  /**
   * معالجة الأخطاء
   */
  private handleError(error: AxiosError): Promise<never> {
    const status = error.response?.status;
    const data = error.response?.data as any;
    
    let errorMessage = 'حدث خطأ غير متوقع';
    let errorCode = 'UNKNOWN_ERROR';

    if (status === 401) {
      errorMessage = 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى';
      errorCode = 'UNAUTHORIZED';
    } else if (status === 403) {
      errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء';
      errorCode = 'FORBIDDEN';
    } else if (status === 404) {
      errorMessage = 'المورد غير موجود';
      errorCode = 'NOT_FOUND';
    } else if (status === 429) {
      errorMessage = 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً';
      errorCode = 'RATE_LIMIT';
    } else if (status === 500) {
      errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
      errorCode = 'SERVER_ERROR';
    }

    if (data?.message) {
      errorMessage = data.message;
    }
    if (data?.code) {
      errorCode = data.code;
    }

    return Promise.reject(new Error(errorMessage));
  }

  // ============================================
  // API Methods
  // ============================================

  /**
   * جلب اشتراك المستخدم الحالي
   */
  async getCurrentSubscription(): Promise<UserSubscription> {
    try {
      const response = await this.client.get('/subscription/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // بيانات وهمية للاختبار
      return {
        userId: 1,
        tier: 'free',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isActive: true,
        executionEnabled: false,
        brokerConnected: false,
      };
    }
  }

  /**
   * جلب جميع الخطط المتاحة
   */
  async getAvailableTiers(): Promise<SubscriptionTier[]> {
    try {
      const response = await this.client.get('/subscription/tiers');
      return response.data.tiers || response.data;
    } catch (error) {
      console.error('Error fetching tiers:', error);
      // بيانات وهمية للاختبار
      return [
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
      ];
    }
  }

  /**
   * ترقية الاشتراك
   */
  async upgrade(request: UpgradeRequest): Promise<UpgradeResponse> {
    try {
      const response = await this.client.post('/subscription/upgrade', request);
      return response.data;
    } catch (
