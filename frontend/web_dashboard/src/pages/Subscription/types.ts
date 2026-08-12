// src/pages/Subscription/types.ts

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
  brokerType?: 'alpaca' | 'interactive_brokers' | 'other';
  remainingSymbols?: number;
}

export interface UpgradeRequest {
  tierId: string;
  paymentMethodId?: string;
  billingCycle: 'monthly' | 'yearly';
  termsAccepted?: boolean;
  consentSignature?: string;
  brokerData?: BrokerAPIData;
}

export interface BrokerAPIData {
  brokerType: 'alpaca' | 'interactive_brokers' | 'other';
  apiKey: string;
  apiSecret: string;
  isPaperTrading?: boolean;
}

export interface UpgradeResponse {
  success: boolean;
  message: string;
  subscription: UserSubscription;
  errors?: string[];
}

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
