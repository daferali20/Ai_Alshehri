// src/pages/Subscription/components/PricingCard.tsx
import React from 'react';
import { SubscriptionTier } from '../types';

interface PricingCardProps {
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  isCurrent: boolean;
  onUpgrade: () => void;
  isLoading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  billingCycle,
  isCurrent,
  onUpgrade,
  isLoading = false,
}) => {
  const price = billingCycle === 'monthly' ? tier.price : tier.priceYearly;

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: `2px solid ${tier.highlight ? '#f59e0b' : '#2d2d4a'}`,
      boxShadow: tier.highlight ? '0 0 20px rgba(245, 158, 11, 0.2)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {tier.badge && (
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: '#f59e0b',
            color: 'black',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}>{tier.badge}</span>
        </div>
      )}
      <h3 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
        {tier.name}
      </h3>
      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>{tier.nameEn}</p>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
        {tier.description}
      </p>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>${price}</span>
        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          /{billingCycle === 'monthly' ? 'شهر' : 'سنة'}
        </span>
      </div>

      <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', padding: '0.25rem 0' }}>
          <span style={{ color: '#10b981' }}>✓</span>
          <span>{tier.features.maxSymbols === -1 ? 'غير محدود' : tier.features.maxSymbols} سهم</span>
        </li>
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', padding: '0.25rem 0' }}>
          <span style={{ color: '#10b981' }}>✓</span>
          <span>{tier.features.updateInterval === 'realtime' ? 'لحظي' : tier.features.updateInterval === 'hourly' ? 'كل ساعة' : 'يومي'}</span>
        </li>
        {tier.features.sentimentAnalysis && (
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', padding: '0.25rem 0' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span>تحليل المشاعر</span>
          </li>
        )}
        {tier.features.autoExecution && (
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', padding: '0.25rem 0' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span>تنفيذ تلقائي ⚡</span>
          </li>
        )}
      </ul>

      <button
        onClick={onUpgrade}
        disabled={isCurrent || isLoading}
        style={{
          width: '100%',
          marginTop: '1.5rem',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: isCurrent || isLoading ? 'not-allowed' : 'pointer',
          background: isCurrent ? '#475569' : tier.color === 'gold' ? '#f59e0b' : tier.color === 'purple' ? '#8b5cf6' : tier.color === 'blue' ? '#3b82f6' : '#64748b',
          color: 'white',
          opacity: isCurrent ? 0.5 : 1,
        }}
      >
        {isCurrent ? 'خطتك الحالية' : isLoading ? 'جاري...' : 'اختر الخطة'}
      </button>
    </div>
  );
};

export default PricingCard;
