// frontend/web_dashboard/src/pages/Subscription/SubscriptionPage.tsx
import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon, StarIcon, CrownIcon } from '@heroicons/react/solid';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import PricingCard from './components/PricingCard';
import PricingTable from './components/PricingTable';
import UpgradeModal from './components/UpgradeModal';
import { SubscriptionTier, TierFeatures } from './types';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    subscription, 
    upgradeSubscription, 
    loading,
    error 
  } = useSubscription();
  
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const tiers: SubscriptionTier[] = [
    {
      id: 'free',
      name: 'مجاني',
      nameEn: 'Free',
      price: 0,
      priceYearly: 0,
      description: 'مثالي للبدء واستكشاف المنصة',
      features: {
        aiRecommendations: true,
        maxSymbols: 3,
        updateInterval: 'daily',
        sentimentAnalysis: false,
        lstmModel: false,
        transformerModel: false,
        advancedCharts: false,
        pushNotifications: false,
        autoExecution: false,
        customStrategies: false,
        prioritySupport: false,
      },
      color: 'gray',
      popular: false,
      highlight: false,
      badge: null
    },
    {
      id: 'basic',
      name: 'أساسي',
      nameEn: 'Basic',
      price: 29,
      priceYearly: 290,
      description: 'للمتداولين الجادين الذين يحتاجون تحليلاً أفضل',
      features: {
        aiRecommendations: true,
        maxSymbols: 10,
        updateInterval: 'hourly',
        sentimentAnalysis: false,
        lstmModel: false,
        transformerModel: false,
        advancedCharts: true,
        pushNotifications: false,
        autoExecution: false,
        customStrategies: false,
        prioritySupport: false,
      },
      color: 'blue',
      popular: true,
      highlight: false,
      badge: 'الأكثر طلباً'
    },
    {
      id: 'pro',
      name: 'احترافي',
      nameEn: 'Pro',
      price: 99,
      priceYearly: 990,
      description: 'للمتداولين المحترفين الذين يحتاجون تحليلاً فورياً',
      features: {
        aiRecommendations: true,
        maxSymbols: 50,
        updateInterval: 'realtime',
        sentimentAnalysis: true,
        lstmModel: true,
        transformerModel: false,
        advancedCharts: true,
        pushNotifications: true,
        autoExecution: false,
        customStrategies: false,
        prioritySupport: false,
      },
      color: 'purple',
      popular: false,
      highlight: false,
      badge: null
    },
    {
      id: 'premium',
      name: 'مميز',
      nameEn: 'Premium',
      price: 299,
      priceYearly: 2990,
      description: 'لكل ما تحتاجه من تحليل وتنفيذ تلقائي كامل',
      features: {
        aiRecommendations: true,
        maxSymbols: -1, // غير محدود
        updateInterval: 'realtime',
        sentimentAnalysis: true,
        lstmModel: true,
        transformerModel: true,
        advancedCharts: true,
        pushNotifications: true,
        autoExecution: true,
        customStrategies: true,
        prioritySupport: true,
      },
      color: 'gold',
      popular: false,
      highlight: true,
      badge: '👑 الأفضل',
      specialNote: 'يتطلب إضافة مفاتيح API الخاصة بك'
    }
  ];

  const handleUpgrade = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    if (tier.id === 'premium') {
      setShowUpgradeModal(true);
    } else {
      upgradeSubscription(tier.id);
    }
  };

  const handleBillingToggle = (cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            اختر خطتك المناسبة
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto">
            خطط مرنة تناسب جميع المستويات. التنفيذ التلقائي متاح فقط في خطة PREMIUM
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => handleBillingToggle('monthly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => handleBillingToggle('yearly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'yearly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              سنوي (وفر 20%)
            </button>
          </div>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="bg-gray-800 rounded-lg p-4 mb-8 border border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-gray-400">اشتراكك الحالي:</span>
                <span className="text-white font-bold ml-2">
                  {subscription.tier.toUpperCase()}
                </span>
                {subscription.executionEnabled && (
                  <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                    ✅ التنفيذ التلقائي مفعل
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                ينتهي في: {new Date(subscription.endDate).toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              billingCycle={billingCycle}
              isCurrent={subscription?.tier === tier.id}
              onUpgrade={() => handleUpgrade(tier)}
            />
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              📊 مقارنة الميزات بالتفصيل
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              قارن بين جميع الخطط واختر الأنسب لك
            </p>
          </div>
          
          <PricingTable 
            tiers={tiers} 
            currentTier={subscription?.tier}
            billingCycle={billingCycle}
          />
        </div>

        {/* Legal Notice */}
        <div className="mt-8 bg-gray-800/50 rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div>
              <p className="text-yellow-500 font-semibold">تنبيه قانوني هام</p>
              <p className="text-sm text-gray-400 mt-1">
                التنفيذ التلقائي للأوامر متاح فقط لمشتركي PREMIUM ويتطلب موافقة صريحة 
                وإضافة مفاتيح API الخاصة بك. المنصة تقدم توصيات تحليلية فقط، 
                والمستخدم يتحمل المسؤولية الكاملة عن جميع قرارات التداول.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            ❓ أسئلة شائعة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white">هل يمكنني الترقية في أي وقت؟</h4>
              <p className="text-sm text-gray-400 mt-1">نعم، يمكنك الترقية أو التخفيض في أي وقت. يتم تعديل الفاتورة تلقائياً.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white">ماذا يحدث إذا قمت بإلغاء الاشتراك؟</h4>
              <p className="text-sm text-gray-400 mt-1">ستفقد الميزات المدفوعة، لكن تبقى التوصيات الأساسية متاحة مجاناً.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white">هل التنفيذ التلقائي آمن؟</h4>
              <p className="text-sm text-gray-400 mt-1">نعم، يتم تشفير مفاتيح API الخاصة بك ولا يتم مشاركتها مع أي طرف ثالث.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white">هل يمكنني تجربة PREMIUM؟</h4>
              <p className="text-sm text-gray-400 mt-1">نقدم فترة تجريبية مجانية لمدة 7 أيام لخطة PREMIUM.</p>
            </div>
          </div>
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          tier={selectedTier}
          onConfirm={upgradeSubscription}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;
