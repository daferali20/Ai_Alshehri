// frontend/web_dashboard/src/pages/Subscription/components/PricingCard.tsx
import React from 'react';
import { CheckIcon, XIcon } from '@heroicons/react/solid';
import { SubscriptionTier } from '../types';

interface PricingCardProps {
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  isCurrent: boolean;
  onUpgrade: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  billingCycle,
  isCurrent,
  onUpgrade
}) => {
  const getPrice = () => {
    return billingCycle === 'monthly' ? tier.price : tier.priceYearly;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      gray: 'border-gray-600 hover:border-gray-400',
      blue: 'border-blue-500 hover:border-blue-400',
      purple: 'border-purple-500 hover:border-purple-400',
      gold: 'border-yellow-500 hover:border-yellow-400 shadow-yellow-500/20 shadow-lg'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getButtonColor = (color: string) => {
    const colors = {
      gray: 'bg-gray-600 hover:bg-gray-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      gold: 'bg-yellow-600 hover:bg-yellow-700'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getFeatureIcon = (feature: boolean) => {
    return feature ? (
      <CheckIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XIcon className="h-5 w-5 text-gray-600" />
    );
  };

  // قائمة الميزات المعروضة في البطاقة
  const displayedFeatures = [
    { key: 'aiRecommendations', label: 'توصيات ذكاء اصطناعي' },
    { key: 'sentimentAnalysis', label: 'تحليل المشاعر' },
    { key: 'advancedCharts', label: 'رسوم بيانية متقدمة' },
    { key: 'pushNotifications', label: 'تنبيهات فورية' },
    { key: 'autoExecution', label: 'تنفيذ تلقائي' },
  ];

  // معرفة ما إذا كانت الخطة مميزة
  const isPremium = tier.id === 'premium';
  const isPopular = tier.popular;
  const isHighlight = tier.highlight;

  return (
    <div 
      className={`
        relative bg-gray-800 rounded-xl border-2 p-6 transition-all duration-300
        hover:transform hover:scale-105
        ${getColorClasses(tier.color)}
        ${isHighlight ? 'ring-2 ring-yellow-500' : ''}
        ${isCurrent ? 'border-green-500' : ''}
      `}
    >
      {/* Badge */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
            {tier.badge}
          </span>
        </div>
      )}

      {isPopular && !tier.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-blue-600 text-white">
            الأكثر طلباً
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
            الحالي
          </span>
        </div>
      )}

      {/* Content */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{tier.nameEn}</p>
        <p className="text-xs text-gray-500 mt-2">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mt-4 text-center">
        <span className="text-4xl font-bold text-white">
          ${getPrice()}
        </span>
        <span className="text-sm text-gray-400">
          /{billingCycle === 'monthly' ? 'شهر' : 'سنة'}
        </span>
        {billingCycle === 'yearly' && tier.price > 0 && (
          <div className="text-xs text-green-400 mt-1">
            وفر ${Math.round(tier.price * 12 - tier.priceYearly)}
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="mt-6 space-y-2">
        {displayedFeatures.map((feature) => {
          const value = tier.features[feature.key as keyof typeof tier.features];
          const isActive = typeof value === 'boolean' ? value : true;
          
          // تخصيص عرض عدد الأسهم
          if (feature.key === 'aiRecommendations') {
            const maxSymbols = tier.features.maxSymbols;
            const label = maxSymbols === -1 
              ? 'أسهم غير محدودة' 
              : `${maxSymbols} سهم كحد أقصى`;
            return (
              <li key={feature.key} className="flex items-center gap-2">
                <span className="text-green-500">📊</span>
                <span className="text-sm text-gray-300">{label}</span>
              </li>
            );
          }
          
          return (
            <li key={feature.key} className="flex items-center gap-2">
              {getFeatureIcon(isActive)}
              <span className={`text-sm ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.label}
                {feature.key === 'autoExecution' && isActive && (
                  <span className="text-xs text-yellow-500 ml-1">*</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Special Note for Premium */}
      {isPremium && (
        <div className="mt-3 text-xs text-yellow-500 text-center bg-yellow-500/10 rounded-lg p-2">
          ⚠️ يتطلب إضافة مفاتيح API الخاصة بك
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onUpgrade}
        disabled={isCurrent}
        className={`
          w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white
          transition-all duration-200
          ${isCurrent ? 'bg-gray-600 cursor-not-allowed opacity-50' : getButtonColor(tier.color)}
          hover:shadow-lg hover:shadow-${tier.color}-500/25
        `}
      >
        {isCurrent ? 'خطتك الحالية' : 'اختر الخطة'}
      </button>

      {/* Free tier note */}
      {tier.id === 'free' && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          مجاني دائماً، بدون بطاقة ائتمان
        </p>
      )}
    </div>
  );
};

export default PricingCard;
