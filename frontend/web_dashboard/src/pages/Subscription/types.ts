export interface SubscriptionFeatures {
  aiRecommendations: boolean;
  maxSymbols: number;
  updateInterval: 'daily' | 'hourly' | 'realtime';
  sentimentAnalysis: boolean;
  lstmModel: boolean;
  transformerModel: boolean;
  advancedCharts: boolean;
  pushNotifications: boolean;
  autoExecution: boolean;
  customStrategies: boolean;
  prioritySupport: boolean;
}

export interface SubscriptionTier {
  id: 'free' | 'basic' | 'pro' | 'premium';
  name: string;
  nameEn: string;
  price: number;
  priceYearly: number;
  description: string;
  features: SubscriptionFeatures;
  color: 'gray' | 'blue' | 'purple' | 'gold';
  popular: boolean;
  highlight: boolean;
  badge: string | null;
  specialNote?: string;
}

export interface UserSubscription {
  userId: number;
  tier: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  executionEnabled: boolean;
  brokerConnected: boolean;
}

export interface UpgradeRequest {
  tierId: string;
  billingCycle: 'monthly' | 'yearly';
  termsAccepted?: boolean;
  consentSignature?: string;
  brokerData?: any;
}

export interface UpgradeResponse {
  success: boolean;
  message: string;
  subscription: UserSubscription;
}
