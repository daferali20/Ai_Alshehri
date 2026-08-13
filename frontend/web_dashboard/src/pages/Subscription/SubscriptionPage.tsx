import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription.ts';
import PricingCard from './components/PricingCard';
import UpgradeModal from './components/UpgradeModal';

const SubscriptionPage: React.FC = () => {
  const {
    subscription,
    availableTiers,
    loading,
    error,
    isUpgrading,
    upgradeSubscription,
  } = useSubscription();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgrade = (tier: any) => {
    setSelectedTier(tier);
    if (tier.id === 'premium') {
      setShowUpgradeModal(true);
    } else {
      upgradeSubscription(tier.id, { billingCycle });
    }
  };

  const handlePremiumUpgrade = async (data: any) => {
    await upgradeSubscription('premium', {
      billingCycle,
      termsAccepted: true,
      consentSignature: data.consentSignature,
      brokerData: {
        brokerType: data.brokerType,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
      },
    });
    setShowUpgradeModal(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #1a1a2e', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '3rem', height: '3rem', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#94a3b8' }}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', color: 'white', marginBottom: '1rem' }}>
          اختر خطتك المناسبة
        </h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
          التنفيذ التلقائي متاح فقط في خطة PREMIUM
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              background: billingCycle === 'monthly' ? '#3b82f6' : '#2d2d4a',
              color: billingCycle === 'monthly' ? 'white' : '#94a3b8',
            }}
            onClick={() => setBillingCycle('monthly')}
          >
            شهري
          </button>
          <button
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              background: billingCycle === 'yearly' ? '#3b82f6' : '#2d2d4a',
              color: billingCycle === 'yearly' ? 'white' : '#94a3b8',
            }}
            onClick={() => setBillingCycle('yearly')}
          >
            سنوي <span style={{ color: '#10b981', fontSize: '0.75rem' }}>وفر 20%</span>
          </button>
        </div>

        {subscription && (
          <div style={{ background: '#1a1a2e', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>اشتراكك الحالي:</span>
                <span style={{ color: 'white', fontWeight: 'bold', marginLeft: '0.5rem' }}>{subscription.tier.toUpperCase()}</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                ينتهي: {new Date(subscription.endDate).toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          {availableTiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              billingCycle={billingCycle}
              isCurrent={subscription?.tier === tier.id}
              onUpgrade={() => handleUpgrade(tier)}
              isLoading={isUpgrading}
            />
          ))}
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          tier={selectedTier}
          onConfirm={handlePremiumUpgrade}
          isLoading={isUpgrading}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;
