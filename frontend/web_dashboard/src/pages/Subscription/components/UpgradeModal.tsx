// src/pages/Subscription/components/UpgradeModal.tsx
import React, { useState } from 'react';
import { SubscriptionTier } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: SubscriptionTier | null;
  onConfirm: (data: any) => void;
  isLoading: boolean;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  tier,
  onConfirm,
  isLoading,
}) => {
  const [step, setStep] = useState<'consent' | 'api'>('consent');
  const [formData, setFormData] = useState({
    brokerType: 'alpaca',
    apiKey: '',
    apiSecret: '',
    consentSignature: '',
    termsAccepted: false,
  });

  if (!isOpen || !tier) return null;

  const handleSubmit = () => {
    onConfirm(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div style={{
        background: '#1a1a2e',
        borderRadius: '1rem',
        maxWidth: '600px',
        width: '100%',
        padding: '1.5rem',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>تفعيل خطة {tier.name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {tier.id === 'premium' ? (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: '0.5rem', borderRadius: '9999px', background: step === 'consent' ? '#f59e0b' : '#10b981' }} />
              <div style={{ flex: 1, height: '0.5rem', borderRadius: '9999px', background: step === 'api' ? '#f59e0b' : '#334155' }} />
            </div>

            {step === 'consent' ? (
              <div>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                  <h4 style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ تنبيه قانوني هام</h4>
                  <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0, color: '#cbd5e1', fontSize: '0.875rem' }}>
                    <li style={{ padding: '0.25rem 0' }}>• أنت تتحمل المسؤولية الكاملة عن جميع قرارات التداول</li>
                    <li style={{ padding: '0.25rem 0' }}>• المنصة غير مسؤولة عن أي خسائر مالية</li>
                    <li style={{ padding: '0.25rem 0' }}>• سيتم استخدام مفاتيح API الخاصة بك فقط لتنفيذ أوامرك</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>التوقيع الإلكتروني</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: '#2d2d4a', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', border: 'none' }}
                    value={formData.consentSignature}
                    onChange={(e) => setFormData({...formData, consentSignature: e.target.value})}
                    placeholder="اكتب اسمك الكامل"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                  />
                  <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>أوافق على جميع الشروط والأحكام</label>
                </div>

                <button
                  style={{ width: '100%', background: '#f59e0b', color: 'white', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                  onClick={() => setStep('api')}
                  disabled={!formData.consentSignature || !formData.termsAccepted}
                >
                  التالي: إضافة مفاتيح API
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>نوع الوسيط</label>
                  <select
                    style={{ width: '100%', background: '#2d2d4a', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', border: 'none' }}
                    value={formData.brokerType}
                    onChange={(e) => setFormData({...formData, brokerType: e.target.value})}
                  >
                    <option value="alpaca">Alpaca</option>
                    <option value="interactive_brokers">Interactive Brokers</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>مفتاح API</label>
                  <input
                    type="password"
                    style={{ width: '100%', background: '#2d2d4a', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', border: 'none' }}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    placeholder="أدخل مفتاح API"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>المفتاح السري</label>
                  <input
                    type="password"
                    style={{ width: '100%', background: '#2d2d4a', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', border: 'none' }}
                    value={formData.apiSecret}
                    onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
                    placeholder="أدخل المفتاح السري"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={{ flex: 1, background: '#475569', color: 'white', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    onClick={() => setStep('consent')}
                  >
                    رجوع
                  </button>
                  <button
                    style={{ flex: 1, background: '#f59e0b', color: 'white', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    onClick={handleSubmit}
                    disabled={!formData.apiKey || !formData.apiSecret || isLoading}
                  >
                    {isLoading ? 'جاري التفعيل...' : 'تفعيل التنفيذ التلقائي'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>ستتم ترقية اشتراكك إلى <strong>{tier.name}</strong></p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                style={{ flex: 1, background: '#475569', color: 'white', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                onClick={onClose}
              >
                إلغاء
              </button>
              <button
                style={{ flex: 1, background: '#3b82f6', color: 'white', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                onClick={() => onConfirm(formData)}
                disabled={isLoading}
              >
                {isLoading ? 'جاري الترقية...' : 'تأكيد الترقية'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
