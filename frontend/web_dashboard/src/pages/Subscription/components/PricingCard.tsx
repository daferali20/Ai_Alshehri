import React from 'react';
import { SubscriptionTier } from '../types';

interface PricingCardProps {
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  isCurrent: boolean;
  onUpgrade: () => void;
  isLoading: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  billingCycle,
  isCurrent,
  onUpgrade,
  isLoading,
}) => {
  const currentPrice = billingCycle === 'monthly' ? tier.price : tier.priceYearly;

  return (
    <div
      style={{
        background: '#141414',
        border: tier.highlight ? '2px solid #3b82f6' : '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {tier.badge && (
        <span
          style={{
            position: 'absolute',
            top: '-12px',
            right: '20px',
            background: '#3b82f6',
            color: 'white',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          {tier.badge}
        </span>
      )}

      <div>
        <h3 style={{ color: '#3b82f6', marginBottom: '8px', fontSize: '1.25rem' }}>{tier.name}</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>{tier.description}</p>
        
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '15px', color: '#fff' }}>
          ${currentPrice}
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            /{billingCycle === 'monthly' ? 'شهر' : 'سنة'}
          </span>
        </div>

        {/* عرض مميزات الخطة التفصيلية */}
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px', color: '#ccc', textAlign: 'right', fontSize: '0.9rem' }}>
          <li style={{ marginBottom: '8px' }}>✓ عدد الأسهم المتاحة: {tier.features.maxSymbols}</li>
          <li style={{ marginBottom: '8px' }}>✓ التحديثات: {tier.features.updateInterval}</li>
          {tier.features.aiRecommendations && <li style={{ marginBottom: '8px' }}>✓ توصيات الذكاء الاصطناعي</li>}
          {tier.features.lstmModel && <li style={{ marginBottom: '8px' }}>✓ نموذج LSTM للتوقع</li>}
          {tier.features.transformerModel && <li style={{ marginBottom: '8px' }}>✓ نموذج Transformer التحليلي</li>}
          {tier.features.autoExecution && <li style={{ marginBottom: '8px', color: '#10b981', fontWeight: 'bold' }}>✓ التنفيذ التلقائي للمفهوم</li>}
        </ul>
      </div>

      <button
        disabled={isCurrent || isLoading}
        onClick={onUpgrade}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '6px',
          border: 'none',
          background: isCurrent ? '#2a2a2a' : '#3b82f6',
          color: isCurrent ? '#94a3b8' : 'white',
          fontWeight: 'bold',
          cursor: isCurrent || isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isCurrent ? 'الخطة الحالية' : isLoading ? 'جاري المعالجة...' : 'ترقية الآن'}
      </button>
    </div>
  );
};

export default PricingCard;
