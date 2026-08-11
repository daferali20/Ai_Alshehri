// frontend/web_dashboard/src/pages/Subscription.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Card, Button, Badge, Modal } from '../components';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription, upgradeSubscription, addBrokerAPI, getFeatures } = useSubscription();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [brokerData, setBrokerData] = useState({ type: '', apiKey: '', apiSecret: '' });
  const [consentSignature, setConsentSignature] = useState('');

  const tiers = [
    {
      id: 'free',
      name: 'مجاني',
      price: '0',
      features: ['توصيات أساسية', '3 أسهم كحد أقصى', 'تحديث يومي'],
      color: 'gray'
    },
    {
      id: 'basic',
      name: 'أساسي',
      price: '29',
      features: ['توصيات متقدمة', '10 أسهم', 'تحديث كل ساعة', 'مؤشرات فنية متعددة'],
      color: 'blue',
      popular: true
    },
    {
      id: 'pro',
      name: 'احترافي',
      price: '99',
      features: [
        'توصيات فورية',
        '50 سهم',
        'تحليل لحظي',
        'نماذج ذكاء اصطناعي متقدمة',
        'تحليل المشاعر'
      ],
      color: 'purple'
    },
    {
      id: 'premium',
      name: 'مميز',
      price: '299',
      features: [
        'توصيات غير محدودة',
        'تنفيذ تلقائي للأوامر ⚡',
        'استراتيجيات مخصصة',
        'دعم أولوية',
        'API خاص بالمستخدم',
        'تحليل كامل للسوق'
      ],
      color: 'gold',
      highlight: true
    }
  ];

  const handleUpgrade = async (tierId: string) => {
    if (tierId === 'premium') {
      setShowConsentModal(true);
      return;
    }
    
    await upgradeSubscription(tierId);
  };

  const handleConsentAndUpgrade = async () => {
    // حفظ الموافقة القانونية
    await addBrokerAPI({
      brokerType: brokerData.type,
      apiKey: brokerData.apiKey,
      apiSecret: brokerData.apiSecret,
      consentSignature: consentSignature
    });
    
    setShowConsentModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">خطط الاشتراك</h1>
      <p className="text-gray-400 mb-8">
        اختر الخطة المناسبة لك. التنفيذ التلقائي متاح فقط في خطة PREMIUM
      </p>

      {/* الاشتراك الحالي */}
      {subscription && (
        <div className="bg-gray-800 p-4 rounded-lg mb-8">
          <h3 className="text-lg font-semibold">اشتراكك الحالي</h3>
          <div className="flex items-center gap-4 mt-2">
            <Badge color={getTierColor(subscription.tier)}>
              {subscription.tier.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-400">
              ينتهي في: {new Date(subscription.endDate).toLocaleDateString()}
            </span>
            {subscription.executionEnabled && (
              <Badge color="green">✅ التنفيذ التلقائي مفعل</Badge>
            )}
          </div>
        </div>
      )}

      {/* بطاقات الاشتراكات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={`relative ${tier.highlight ? 'border-2 border-yellow-500' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge color="blue">الأكثر طلباً</Badge>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-gray-400">/شهر</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {tier.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full mt-6"
              color={tier.color}
              onClick={() => handleUpgrade(tier.id)}
              disabled={subscription?.tier === tier.id}
            >
              {subscription?.tier === tier.id ? 'الاشتراك الحالي' : 'اشتراك'}
            </Button>

            {tier.id === 'premium' && (
              <div className="mt-2 text-xs text-yellow-500 text-center">
                ⚠️ يتطلب إضافة مفاتيح API الخاصة بك
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* موافقة PREMIUM */}
      <Modal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        title="تفعيل التنفيذ التلقائي - موافقة قانونية"
      >
        <div className="space-y-4">
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-500">
            <h4 className="text-red-500 font-bold">⚠️ تنبيه قانوني هام</h4>
            <ul className="mt-2 text-sm space-y-2">
              <li>• أنت توافق على أن المنصة مجرد أداة تحليل وتوصيات</li>
              <li>• أنت تتحمل المسؤولية الكاملة عن جميع قرارات التداول</li>
              <li>• المنصة غير مسؤولة عن أي خسائر مالية</li>
              <li>• سيتم استخدام مفاتيح API الخاصة بك فقط لتنفيذ أوامرك</li>
              <li>• يتم تسجيل جميع الصفقات لأغراض التدقيق</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm mb-1">نوع الوسيط</label>
            <select
              className="w-full bg-gray-700 rounded p-2"
              value={brokerData.type}
              onChange={(e) => setBrokerData({...brokerData, type: e.target.value})}
            >
              <option value="">اختر الوسيط...</option>
              <option value="alpaca">Alpaca</option>
              <option value="interactive_brokers">Interactive Brokers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">مفتاح API</label>
            <input
              type="password"
              className="w-full bg-gray-700 rounded p-2"
              value={brokerData.apiKey}
              onChange={(e) => setBrokerData({...brokerData, apiKey: e.target.value})}
              placeholder="أدخل مفتاح API الخاص بك"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">المفتاح السري API</label>
            <input
              type="password"
              className="w-full bg-gray-700 rounded p-2"
              value={brokerData.apiSecret}
              onChange={(e) => setBrokerData({...brokerData, apiSecret: e.target.value})}
              placeholder="أدخل المفتاح السري API"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              التوقيع الإلكتروني (اكتب اسمك الكامل للموافقة)
            </label>
            <input
              type="text"
              className="w-full bg-gray-700 rounded p-2"
              value={consentSignature}
              onChange={(e) => setConsentSignature(e.target.value)}
              placeholder="الاسم الكامل"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1"
              color="red"
              onClick={() => setShowConsentModal(false)}
            >
              إلغاء
            </Button>
            <Button
              className="flex-1"
              color="gold"
              onClick={handleConsentAndUpgrade}
              disabled={!consentSignature || !brokerData.apiKey}
            >
              أوافق وأفعل التنفيذ التلقائي
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionPage;
