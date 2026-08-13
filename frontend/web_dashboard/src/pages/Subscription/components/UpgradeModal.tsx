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
  const [brokerType, setBrokerType] = useState('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [consentSignature, setConsentSignature] = useState('');

  if (!isOpen || !tier) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      brokerType,
      apiKey,
      apiSecret,
      consentSignature,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        direction: 'rtl',
      }}
    >
      <div
        style={{
          background: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          color: '#fff',
        }}
      >
        <h2 style={{ marginBottom: '15px', color: '#3b82f6' }}>تأكيد ترقية خطة PREMIUM</h2>
        <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '20px' }}>
          تتطلب ميزة التنفيذ التلقائي ربط حساب الوسيط الخاص بك والموافقة الإلكترونية.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>اختر المنصة / الوسيط:</label>
            <select
              value={brokerType}
              onChange={(e) => setBrokerType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#222',
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '6px',
              }}
            >
              <option value="binance">Binance</option>
              <option value="interactive_brokers">Interactive Brokers</option>
              <option value="alpaca">Alpaca</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>مفتاح API Key:</label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#222',
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '6px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>مفتاح API Secret:</label>
            <input
              type="password"
              required
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#222',
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '6px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>التوقيع الإلكتروني (اسمك الكامل):</label>
            <input
              type="text"
              required
              value={consentSignature}
              onChange={(e) => setConsentSignature(e.target.value)}
              placeholder="اكتب اسمك للموافقة"
              style={{
                width: '100%',
                padding: '8px',
                background: '#222',
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '6px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {isLoading ? 'جاري التأكيد...' : 'تأكيد الترقية'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                background: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpgradeModal;
