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
  const price = billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly;

  return (
    <div
      style={{
        background: '#141414',
        border: isCurrent ? '2px solid #3b82f6' : '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
      }}
    >
      {isCurrent && (
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
          خطة الحالية
        </span>
      )}

      <div>
        <h3 style={{ color: '#3b82f6', marginBottom: '10px', fontSize: '1.25rem' }}>{tier.name}</h3>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '15px', color: '#fff' }}>
          ${price}
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            /{billingCycle === 'monthly' ? 'شهر' : 'سنة'}
          </span>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px', color: '#ccc', textAlign: 'right' }}>
          {tier.features.map((feature, index) => (
            <li key={index} style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
              ✓ {feature}
            </li>
          ))}
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
        {isCurrent ? 'خيارات الخطة الحالية' : isLoading ? 'جاري المعالجة...' : 'ترقية الآن'}
      </button>
    </div>
  );
};

export default PricingCard;
