// frontend/web_dashboard/src/services/api/subscriptionApi.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  UserSubscription, 
  SubscriptionTier, 
  UpgradeRequest, 
  UpgradeResponse,
  BrokerAPIData,
  Invoice,
  SubscriptionError,
  SubscriptionErrorCodes
} from '../../pages/Subscription/types';

/**
 * إعدادات الـ API
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
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
      errorCode = SubscriptionErrorCodes.INVALID_TIER; // استخدام كود مناسب
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

    // إذا كان هناك رسالة خطأ من الخادم
    if (data?.message) {
      errorMessage = data.message;
    }
    if (data?.code) {
      errorCode = data.code;
    }

    const subscriptionError = new SubscriptionError(
      errorCode,
      errorMessage,
      status || 500,
      data?.details
    );

    return Promise.reject(subscriptionError);
  }

  // ============================================
  // API Methods
  // ============================================

  /**
   * جلب اشتراك المستخدم الحالي
   */
  async getCurrentSubscription(): Promise<UserSubscription> {
    const response = await this.client.get('/subscription/current');
    return response.data;
  }

  /**
   * جلب جميع الخطط المتاحة
   */
  async getAvailableTiers(): Promise<SubscriptionTier[]> {
    const response = await this.client.get('/subscription/tiers');
    return response.data;
  }

  /**
   * ترقية الاشتراك
   */
  async upgrade(request: UpgradeRequest): Promise<UpgradeResponse> {
    const response = await this.client.post('/subscription/upgrade', request);
    return response.data;
  }

  /**
   * إلغاء الاشتراك
   */
  async cancel(): Promise<{ success: boolean; subscription: UserSubscription }> {
    const response = await this.client.post('/subscription/cancel');
    return response.data;
  }

  /**
   * إضافة مفاتيح API للوسيط
   */
  async addBrokerAPI(data: {
    brokerType: string;
    apiKey: string;
    apiSecret: string;
    consentSignature: string;
    isPaperTrading?: boolean;
  }): Promise<{ success: boolean; subscription: UserSubscription }> {
    const response = await this.client.post('/subscription/broker-api', data);
    return response.data;
  }

  /**
   * إزالة مفاتيح API للوسيط
   */
  async removeBrokerAPI(): Promise<{ success: boolean; subscription: UserSubscription }> {
    const response = await this.client.delete('/subscription/broker-api');
    return response.data;
  }

  /**
   * التحقق من صلاحية الاشتراك
   */
  async checkValidity(): Promise<boolean> {
    const response = await this.client.get('/subscription/validity');
    return response.data.isValid;
  }

  /**
   * جلب تاريخ الفواتير
   */
  async getInvoices(limit: number = 10, offset: number = 0): Promise<{
    invoices: Invoice[];
    total: number;
  }> {
    const response = await this.client.get('/subscription/invoices', {
      params: { limit, offset }
    });
    return response.data;
  }

  /**
   * جلب فاتورة محددة
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await this.client.get(`/subscription/invoices/${invoiceId}`);
    return response.data;
  }

  /**
   * تحميل فاتورة بصيغة PDF
   */
  async downloadInvoicePDF(invoiceId: string): Promise<Blob> {
    const response = await this.client.get(`/subscription/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * تحديث طريقة الدفع
   */
  async updatePaymentMethod(paymentMethodId: string): Promise<{ success: boolean }> {
    const response = await this.client.put('/subscription/payment-method', {
      paymentMethodId
    });
    return response.data;
  }

  /**
   * الحصول على حالة التنفيذ (لـ PREMIUM)
   */
  async getExecutionStatus(): Promise<{
    enabled: boolean;
    brokerConnected: boolean;
    consentGiven: boolean;
    brokerType?: string;
  }> {
    const response = await this.client.get('/subscription/execution-status');
    return response.data;
  }

  /**
   * تسجيل موافقة التنفيذ التلقائي
   */
  async giveExecutionConsent(signature: string): Promise<{ success: boolean }> {
    const response = await this.client.post('/subscription/execution-consent', {
      signature
    });
    return response.data;
  }

  /**
   * الحصول على سجل التدقيق (للمستخدمين المميزين)
   */
  async getAuditLog(limit: number = 50, offset: number = 0): Promise<{
    logs: any[];
    total: number;
  }> {
    const response = await this.client.get('/subscription/audit-log', {
      params: { limit, offset }
    });
    return response.data;
  }
}

// ============================================
// تصدير نسخة واحدة من الخدمة (Singleton)
// ============================================

export const subscriptionApi = new SubscriptionApiService();

// ============================================
// تصدير افتراضي للاستخدام في التطبيق
// ============================================

export default subscriptionApi;
