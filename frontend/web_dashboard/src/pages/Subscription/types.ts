// src/pages/Subscription/types.ts

/**
 * الميزات المتاحة في كل خطة اشتراك
 */
export interface SubscriptionFeatures {
  /** توصيات مدعومة بالذكاء الاصطناعي */
  aiRecommendations: boolean;
  
  /** الحد الأقصى لعدد الأسهم (-1 يعني غير محدود) */
  maxSymbols: number;
  
  /** فترة تحديث البيانات */
  updateInterval: 'daily' | 'hourly' | 'realtime';
  
  /** تحليل المشاعر من وسائل التواصل والأخبار */
  sentimentAnalysis: boolean;
  
  /** نموذج LSTM للتنبؤ بالسلاسل الزمنية */
  lstmModel: boolean;
  
  /** نموذج Transformer المتقدم */
  transformerModel: boolean;
  
  /** رسوم بيانية متقدمة وتفاعلية */
  advancedCharts: boolean;
  
  /** تنبيهات فورية عبر Push Notifications */
  pushNotifications: boolean;
  
  /** تنفيذ تلقائي للأوامر (يتطلب API خاص بالمستخدم) */
  autoExecution: boolean;
  
  /** استراتيجيات تداول مخصصة */
  customStrategies: boolean;
  
  /** دعم فني ذو أولوية */
  prioritySupport: boolean;
}

/**
 * خطة اشتراك كاملة
 */
export interface SubscriptionTier {
  /** معرف فريد للخطة */
  id: 'free' | 'basic' | 'pro' | 'premium';
  
  /** اسم الخطة بالعربية */
  name: string;
  
  /** اسم الخطة بالإنجليزية */
  nameEn: string;
  
  /** السعر الشهري بالدولار */
  price: number;
  
  /** السعر السنوي بالدولار (مع خصم) */
  priceYearly: number;
  
  /** وصف مختصر للخطة */
  description: string;
  
  /** الميزات المتضمنة في الخطة */
  features: SubscriptionFeatures;
  
  /** اللون الأساسي للخطة */
  color: 'gray' | 'blue' | 'purple' | 'gold';
  
  /** هل هذه الخطة الأكثر طلباً؟ */
  popular: boolean;
  
  /** هل الخطة مميزة (مثل PREMIUM)؟ */
  highlight: boolean;
  
  /** نص يظهر كشارة على البطاقة (مثل "الأفضل") */
  badge: string | null;
  
  /** ملاحظة خاصة (مثل متطلبات PREMIUM) */
  specialNote?: string;
}

/**
 * اشتراك المستخدم الحالي
 */
export interface UserSubscription {
  /** معرف المستخدم */
  userId: number;
  
  /** مستوى الاشتراك الحالي */
  tier: string;
  
  /** تاريخ بداية الاشتراك */
  startDate: string;
  
  /** تاريخ نهاية الاشتراك */
  endDate: string;
  
  /** هل الاشتراك نشط؟ */
  isActive: boolean;
  
  /** هل تم تفعيل التنفيذ التلقائي؟ */
  executionEnabled: boolean;
  
  /** هل تم ربط حساب الوسيط؟ */
  brokerConnected: boolean;
  
  /** نوع الوسيط المتصل (إن وجد) */
  brokerType?: 'alpaca' | 'interactive_brokers' | 'other';
  
  /** عدد الأسهم المتبقية (للخطط المحدودة) */
  remainingSymbols?: number;
}

/**
 * طلب ترقية الاشتراك
 */
export interface UpgradeRequest {
  /** معرف الخطة المطلوبة */
  tierId: string;
  
  /** طريقة الدفع */
  paymentMethodId?: string;
  
  /** دورة الفوترة */
  billingCycle: 'monthly' | 'yearly';
  
  /** موافقة على الشروط (لـ PREMIUM) */
  termsAccepted?: boolean;
  
  /** التوقيع الإلكتروني (لـ PREMIUM) */
  consentSignature?: string;
  
  /** بيانات الوسيط (لـ PREMIUM) */
  brokerData?: BrokerAPIData;
}

/**
 * بيانات مفاتيح API للوسيط
 */
export interface BrokerAPIData {
  /** نوع الوسيط */
  brokerType: 'alpaca' | 'interactive_brokers' | 'other';
  
  /** مفتاح API العام */
  apiKey: string;
  
  /** المفتاح السري API */
  apiSecret: string;
  
  /** هل هذا حساب تجريبي (Paper Trading)؟ */
  isPaperTrading?: boolean;
}

/**
 * رد الترقية
 */
export interface UpgradeResponse {
  /** نجاح العملية */
  success: boolean;
  
  /** رسالة تأكيد */
  message: string;
  
  /** بيانات الاشتراك الجديد */
  subscription: UserSubscription;
  
  /** أخطاء إن وجدت */
  errors?: string[];
}

/**
 * خطأ مخصص للاشتراكات
 */
export class SubscriptionError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

/**
 * أكواد أخطاء الاشتراكات
 */
export const SubscriptionErrorCodes = {
  INVALID_TIER: 'INVALID_TIER',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  BROKER_API_REQUIRED: 'BROKER_API_REQUIRED',
  BROKER_API_INVALID: 'BROKER_API_INVALID',
} as const;

export type SubscriptionErrorCode = typeof SubscriptionErrorCodes[keyof typeof SubscriptionErrorCodes];
