// frontend/web_dashboard/src/pages/Subscription/types.ts

/**
 * ============================================
 * تعريفات مستويات الاشتراك (Subscription Tiers)
 * ============================================
 */

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
 * ============================================
 * تعريفات اشتراك المستخدم
 * ============================================
 */

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
  
  /** تاريخ آخر تحديث للبيانات */
  lastDataUpdate?: string;
  
  /** عدد التوصيات المستخدمة هذا الشهر */
  recommendationsUsed?: number;
  
  /** الحد الأقصى للتوصيات هذا الشهر */
  recommendationsLimit?: number;
}

/**
 * ============================================
 * تعريفات الدفع والفواتير
 * ============================================
 */

/**
 * خيارات الدفع
 */
export interface PaymentMethod {
  /** معرف طريقة الدفع */
  id: string;
  
  /** نوع الدفع */
  type: 'credit_card' | 'debit_card' | 'paypal' | 'crypto';
  
  /** اسم طريقة الدفع (للشاشة) */
  name: string;
  
  /** آخر 4 أرقام (للبطاقات) */
  last4?: string;
  
  /** تاريخ انتهاء الصلاحية (للبطاقات) */
  expiryDate?: string;
  
  /** هل طريقة الدفع مفعلة؟ */
  isDefault: boolean;
}

/**
 * الفاتورة
 */
export interface Invoice {
  /** رقم الفاتورة */
  id: string;
  
  /** معرف المستخدم */
  userId: number;
  
  /** تاريخ الفاتورة */
  date: string;
  
  /** تاريخ الاستحقاق */
  dueDate: string;
  
  /** المبلغ الإجمالي */
  totalAmount: number;
  
  /** العملة */
  currency: 'USD' | 'EUR' | 'SAR';
  
  /** حالة الفاتورة */
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  
  /** تفاصيل الفاتورة */
  items: InvoiceItem[];
  
  /** رابط تحميل PDF */
  pdfUrl?: string;
}

/**
 * بند في الفاتورة
 */
export interface InvoiceItem {
  /** وصف البند */
  description: string;
  
  /** الكمية */
  quantity: number;
  
  /** السعر الواحد */
  unitPrice: number;
  
  /** المبلغ الإجمالي للبند */
  total: number;
}

/**
 * ============================================
 * تعريفات طلبات وردود API
 * ============================================
 */

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
  
  /** بيانات الفاتورة إن وجدت */
  invoice?: Invoice;
  
  /** أخطاء إن وجدت */
  errors?: string[];
}

/**
 * ============================================
 * تعريفات الميزات القانونية والامتثال
 * ============================================
 */

/**
 * موافقات المستخدم القانونية
 */
export interface UserConsents {
  /** معرف المستخدم */
  userId: number;
  
  /** موافقة على الشروط العامة */
  termsAccepted: boolean;
  
  /** تاريخ موافقة الشروط */
  termsAcceptedAt?: string;
  
  /** موافقة على تنفيذ الأوامر (PREMIUM) */
  executionConsentGiven: boolean;
  
  /** تاريخ موافقة التنفيذ */
  executionConsentAt?: string;
  
  /** التوقيع الإلكتروني */
  consentSignature?: string;
  
  /** إصدار المستند القانوني */
  documentVersion: string;
  
  /** هل تم تقديم إثبات الهوية؟ */
  identityVerified: boolean;
}

/**
 * سجل التدقيق (للأمان القانوني)
 */
export interface AuditLog {
  /** معرف السجل */
  id: string;
  
  /** معرف المستخدم */
  userId: number;
  
  /** نوع الإجراء */
  action: 'login' | 'upgrade' | 'downgrade' | 'cancel' | 'execute_trade' | 'api_added' | 'api_removed';
  
  /** تفاصيل الإجراء (JSON) */
  details: Record<string, any>;
  
  /** عنوان IP */
  ipAddress: string;
  
  /** متصفح المستخدم */
  userAgent: string;
  
  /** تاريخ الإجراء */
  timestamp: string;
}

/**
 * ============================================
 * تعريفات واجهات المكونات (UI Props)
 * ============================================
 */

/**
 * خصائص مكون PricingCard
 */
export interface PricingCardProps {
  /** بيانات الخطة */
  tier: SubscriptionTier;
  
  /** دورة الفوترة (شهري/سنوي) */
  billingCycle: 'monthly' | 'yearly';
  
  /** هل هذه الخطة هي الخطة الحالية للمستخدم؟ */
  isCurrent: boolean;
  
  /** دالة عند النقر على زر الترقية */
  onUpgrade: () => void;
  
  /** هل العملية قيد التحميل؟ */
  isLoading?: boolean;
}

/**
 * خصائص مكون PricingTable
 */
export interface PricingTableProps {
  /** قائمة الخطط للعرض */
  tiers: SubscriptionTier[];
  
  /** الخطة الحالية للمستخدم */
  currentTier?: string;
  
  /** دورة الفوترة */
  billingCycle: 'monthly' | 'yearly';
  
  /** عرض ملاحظات إضافية */
  showNotes?: boolean;
}

/**
 * خصائص مكون UpgradeModal
 */
export interface UpgradeModalProps {
  /** هل النافذة مفتوحة؟ */
  isOpen: boolean;
  
  /** دالة إغلاق النافذة */
  onClose: () => void;
  
  /** الخطة المختارة للترقية */
  tier: SubscriptionTier | null;
  
  /** دالة تأكيد الترقية */
  onConfirm: (tierId: string, data: UpgradeRequest) => Promise<void>;
  
  /** هل العملية قيد التحميل؟ */
  isLoading?: boolean;
}

/**
 * خصائص مكون FeaturesList
 */
export interface FeaturesListProps {
  /** الميزات للعرض */
  features: SubscriptionFeatures;
  
  /** هل العرض مبسط؟ */
  compact?: boolean;
  
  /** الميزات التي سيتم إخفاؤها */
  hiddenFeatures?: (keyof SubscriptionFeatures)[];
  
  /** تخصيص تسميات الميزات */
  customLabels?: Partial<Record<keyof SubscriptionFeatures, string>>;
}

/**
 * ============================================
 * تعريفات حالة التطبيق (Redux/Context)
 * ============================================
 */

/**
 * حالة الاشتراكات في التطبيق
 */
export interface SubscriptionState {
  /** اشتراك المستخدم الحالي */
  currentSubscription: UserSubscription | null;
  
  /** قائمة الخطط المتاحة */
  availableTiers: SubscriptionTier[];
  
  /** حالة التحميل */
  loading: boolean;
  
  /** أخطاء */
  error: string | null;
  
  /** آخر تحديث */
  lastUpdated: string | null;
}

/**
 * ============================================
 * تعريفات الأدوات المساعدة (Utilities)
 * ============================================
 */

/**
 * خريطة تحويل اسم الخطة إلى لون
 */
export type TierColorMap = {
  [K in SubscriptionTier['id']]: string;
};

/**
 * خريطة تحويل اسم الخطة إلى أيقونة
 */
export type TierIconMap = {
  [K in SubscriptionTier['id']]: string;
};

/**
 * خريطة تحويل فترة التحديث إلى نص عربي
 */
export type UpdateIntervalMap = {
  [K in SubscriptionFeatures['updateInterval']]: string;
};

/**
 * ============================================
 * تعريفات الأحداث (Events)
 * ============================================
 */

/**
 * حدث تغيير الاشتراك
 */
export interface SubscriptionChangeEvent {
  /** المستخدم */
  userId: number;
  
  /** الخطة القديمة */
  oldTier: string;
  
  /** الخطة الجديدة */
  newTier: string;
  
  /** تاريخ التغيير */
  changedAt: string;
  
  /** سبب التغيير */
  reason: 'upgrade' | 'downgrade' | 'cancel' | 'renewal';
}

/**
 * ============================================
 * تعريفات للتحقق من الأنواع (Type Guards)
 * ============================================
 */

/**
 * التحقق من أن الكائن هو SubscriptionTier
 */
export function isSubscriptionTier(obj: any): obj is SubscriptionTier {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    obj.features &&
    typeof obj.features === 'object'
  );
}

/**
 * التحقق من أن الكائن هو UserSubscription
 */
export function isUserSubscription(obj: any): obj is UserSubscription {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'number' &&
    typeof obj.tier === 'string' &&
    typeof obj.isActive === 'boolean'
  );
}

/**
 * ============================================
 * الثوابت (Constants)
 * ============================================
 */

/**
 * الألوان الأساسية لكل خطة
 */
export const TIER_COLORS: TierColorMap = {
  free: 'gray',
  basic: 'blue',
  pro: 'purple',
  premium: 'gold',
};

/**
 * الأيقونات لكل خطة
 */
export const TIER_ICONS: TierIconMap = {
  free: '🆓',
  basic: '🥈',
  pro: '🥇',
  premium: '👑',
};

/**
 * تسميات فترات التحديث بالعربية
 */
export const UPDATE_INTERVAL_LABELS: UpdateIntervalMap = {
  daily: 'يومي',
  hourly: 'كل ساعة',
  realtime: 'لحظي',
};

/**
 * الحدود الافتراضية لكل خطة
 */
export const DEFAULT_LIMITS = {
  free: {
    maxSymbols: 3,
    recommendationsPerMonth: 30,
  },
  basic: {
    maxSymbols: 10,
    recommendationsPerMonth: 100,
  },
  pro: {
    maxSymbols: 50,
    recommendationsPerMonth: 500,
  },
  premium: {
    maxSymbols: -1, // غير محدود
    recommendationsPerMonth: -1, // غير محدود
  },
};

/**
 * ============================================
 * تعريفات الأخطاء (Errors)
 * ============================================
 */

/**
 * أخطاء الاشتراكات المخصصة
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
  UPGRADE_NOT_ALLOWED: 'UPGRADE_NOT_ALLOWED',
  DOWNGRADE_NOT_ALLOWED: 'DOWNGRADE_NOT_ALLOWED',
} as const;

export type SubscriptionErrorCode = typeof SubscriptionErrorCodes[keyof typeof SubscriptionErrorCodes];
