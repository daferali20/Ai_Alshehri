// frontend/web_dashboard/src/pages/Subscription/components/PricingTable.tsx
import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { SubscriptionTier } from '../types';

interface PricingTableProps {
  tiers: SubscriptionTier[];
  currentTier?: string;
  billingCycle: 'monthly' | 'yearly';
}

const PricingTable: React.FC<PricingTableProps> = ({ tiers, currentTier, billingCycle }) => {
  const featureRows = [
    { key: 'aiRecommendations', label: 'توصيات ذكاء اصطناعي', icon: '🤖' },
    { key: 'maxSymbols', label: 'عدد الأسهم', icon: '📊' },
    { key: 'updateInterval', label: 'تحديث البيانات', icon: '🔄' },
    { key: 'sentimentAnalysis', label: 'تحليل المشاعر', icon: '📰' },
    { key: 'lstmModel', label: 'نموذج LSTM', icon: '🧠' },
    { key: 'transformerModel', label: 'نموذج Transformer', icon: '⚡' },
    { key: 'advancedCharts', label: 'رسوم بيانية متقدمة', icon: '📈' },
    { key: 'pushNotifications', label: 'تنبيهات فورية', icon: '🔔' },
    { key: 'autoExecution', label: 'تنفيذ تلقائي', icon: '⚡' },
    { key: 'customStrategies', label: 'استراتيجيات مخصصة', icon: '🎯' },
    { key: 'prioritySupport', label: 'دعم أولوية', icon: '🛡️' },
  ];

  const getDisplayValue = (tier: SubscriptionTier, featureKey: string) => {
    const value = tier.features[featureKey as keyof typeof tier.features];
    if (featureKey === 'maxSymbols') return value === -1 ? 'غير محدود' : `${value}`;
    if (featureKey === 'updateInterval') {
      const intervals: Record<string, string> = { daily: 'يومي', hourly: 'كل ساعة', realtime: 'لحظي' };
      return intervals[String(value)] || String(value ?? '');
    }
    return value;
  };

  const getColorForTier = (tierId: string) => {
    const colors: Record<string, string> = {
      free: 'border-gray-600', basic: 'border-blue-500', pro: 'border-purple-500', premium: 'border-yellow-500'
    };
    return colors[tierId] || 'border-gray-600';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">الميزة</th>
            {tiers.map((tier) => (
              <th key={tier.id} className={`px-6 py-4 text-center text-sm font-bold text-white border-b-2 ${getColorForTier(tier.id)}`}>
                <div>{tier.name}</div>
                <div className="text-xs text-gray-400 font-normal">
                  ${billingCycle === 'monthly' ? tier.price : tier.priceYearly}/{billingCycle === 'monthly' ? 'شهر' : 'سنة'}
                </div>
                {currentTier === tier.id && <div className="text-xs text-green-500 font-normal mt-1">✓ الحالي</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featureRows.map((row) => (
            <tr key={row.key} className="border-b border-gray-700/50 hover:bg-gray-700/30">
              <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap"><span className="ml-2">{row.icon}</span>{row.label}</td>
              {tiers.map((tier) => {
                const value = tier.features[row.key as keyof typeof tier.features];
                const isBoolean = typeof value === 'boolean';
                const displayValue = getDisplayValue(tier, row.key);
                return (
                  <td key={`${tier.id}-${row.key}`} className="px-6 py-4 text-center">
                    {isBoolean ? (value ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XMarkIcon className="h-5 w-5 text-gray-600 mx-auto" />) : <span className="text-sm text-gray-300">{displayValue}</span>}
                    {row.key === 'autoExecution' && value && <div className="text-xs text-yellow-500 mt-1">*</div>}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-t-2 border-gray-700">
            <td className="px-6 py-4 text-sm font-semibold text-gray-300">💰 التكلفة السنوية</td>
            {tiers.map((tier) => (
              <td key={tier.id} className="px-6 py-4 text-center">
                <span className="text-sm font-bold text-white">${tier.priceYearly}</span>
                {tier.price > 0 && <div className="text-xs text-green-400">وفر ${Math.round(tier.price * 12 - tier.priceYearly)}</div>}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="px-6 py-4 bg-yellow-500/5 border-t border-yellow-500/30">
        <p className="text-xs text-yellow-500">* التنفيذ التلقائي للأوامر يتطلب اشتراك PREMIUM وإضافة مفاتيح API الخاصة بك مع موافقة قانونية صريحة</p>
      </div>
    </div>
  );
};

export default PricingTable;
