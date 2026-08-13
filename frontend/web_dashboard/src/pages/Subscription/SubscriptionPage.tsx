import React, { useState } from 'react';

// بيانات خطط الاشتراك التجريبية ليعمل بدون أخطاء استيراد
const MOCK_TIERS = [
  {
    id: 'free',
    name: 'المجانية (FREE)',
    priceMonthly: 0,
    priceYearly: 0,
    features: ['توصيات محدودة', 'تحديثات يومية', 'دعم عبر البريد']
  },
  {
    id: 'pro',
    name: 'المتقدمة (PRO)',
    priceMonthly: 29,
    priceYearly: 290,
    features: ['جميع التوصيات اللحظية', 'مؤشرات فنية متقدمة', 'تنبيات فورية']
  },
  {
    id: 'premium',
    name: 'احترافية (PREMIUM)',
    priceMonthly: 79,
    priceYearly: 790,
    features: ['التنفيذ التلقائي عبر API', 'توصيات الذكاء الاصطناعي', 'دعم خاص 24/7']
  }
];

const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '3rem 1rem', color: 'white', direction: 'rtl' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
          اختر خطتك المناسبة
        </h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
          التنفيذ التلقائي متاح فقط في خطة PREMIUM
        </p>

        {/* أزرار التبديل شهري / سنوي */}
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

        {/* عرض خطط الأسعار */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          {MOCK_TIERS.map((tier) => (
            <div key={tier.id} style={{
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#3b82f6', marginBottom: '10px' }}>{tier.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '15px' }}>
                ${billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly}
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>/{billingCycle === 'monthly' ? 'شهر' : 'سنة'}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px', color: '#ccc', textAlign: 'right' }}>
                {tier.features.map((feature, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>✓ {feature}</li>
                ))}
              </ul>
              <button style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                اشترك الآن
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
