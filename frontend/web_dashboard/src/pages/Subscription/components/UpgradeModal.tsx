// frontend/web_dashboard/src/pages/Subscription/components/UpgradeModal.tsx
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon, CheckIcon } from '@heroicons/react/solid';
import { SubscriptionTier } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: SubscriptionTier | null;
  onConfirm: (tierId: string, data: any) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  tier,
  onConfirm
}) => {
  const [step, setStep] = useState<'consent' | 'api'>('consent');
  const [formData, setFormData] = useState({
    brokerType: 'alpaca',
    apiKey: '',
    apiSecret: '',
    consentSignature: '',
    termsAccepted: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onConfirm(tier?.id || '', formData);
      onClose();
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tier) return null;

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-70" />
          </Transition.Child>

          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative bg-gray-800 rounded-xl max-w-2xl w-full p-6">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <XIcon className="h-6 w-6" />
              </button>

              <Dialog.Title className="text-2xl font-bold text-white mb-4">
                تفعيل خطة {tier.name}
              </Dialog.Title>

              {tier.id === 'premium' ? (
                // PREMIUM Modal with API Keys
                <div className="space-y-4">
                  {/* Step Indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded ${step === 'consent' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <div className={`flex-1 h-2 rounded ${step === 'api' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                  </div>

                  {/* Step 1: Legal Consent */}
                  {step === 'consent' && (
                    <div className="space-y-4">
                      <div className="bg-red-900/20 p-4 rounded-lg border border-red-500">
                        <h4 className="text-red-500 font-bold flex items-center gap-2">
                          ⚠️ تنبيه قانوني هام
                        </h4>
                        <ul className="mt-2 text-sm space-y-2 text-gray-300">
                          <li>• أنت توافق على أن المنصة مجرد أداة تحليل وتوصيات</li>
                          <li>• أنت تتحمل المسؤولية الكاملة عن جميع قرارات التداول</li>
                          <li>• المنصة غير مسؤولة عن أي خسائر مالية</li>
                          <li>• سيتم استخدام مفاتيح API الخاصة بك فقط لتنفيذ أوامرك</li>
                          <li>• يتم تسجيل جميع الصفقات لأغراض التدقيق</li>
                        </ul>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          التوقيع الإلكتروني (اكتب اسمك الكامل للموافقة)
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-700 rounded-lg p-3 text-white"
                          value={formData.consentSignature}
                          onChange={(e) => setFormData({...formData, consentSignature: e.target.value})}
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="termsAccepted"
                          className="w-4 h-4"
                          checked={formData.termsAccepted}
                          onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                        />
                        <label htmlFor="termsAccepted" className="text-sm text-gray-400">
                          أوافق على جميع الشروط والأحكام
                        </label>
                      </div>

                      <button
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition-colors"
                        onClick={() => setStep('api')}
                        disabled={!formData.consentSignature || !formData.termsAccepted}
                      >
                        التالي: إضافة مفاتيح API
                      </button>
                    </div>
                  )}

                  {/* Step 2: API Keys */}
                  {step === 'api' && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-400">
                        أضف مفاتيح API الخاصة بك من الوسيط للسماح بتنفيذ الأوامر التلقائية
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">نوع الوسيط</label>
                        <select
                          className="w-full bg-gray-700 rounded-lg p-3 text-white"
                          value={formData.brokerType}
                          onChange={(e) => setFormData({...formData, brokerType: e.target.value})}
                        >
                          <option value="alpaca">Alpaca</option>
                          <option value="interactive_brokers">Interactive Brokers</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">مفتاح API</label>
                        <input
                          type="password"
                          className="w-full bg-gray-700 rounded-lg p-3 text-white"
                          value={formData.apiKey}
                          onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                          placeholder="أدخل مفتاح API"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">المفتاح السري API</label>
                        <input
                          type="password"
                          className="w-full bg-gray-700 rounded-lg p-3 text-white"
                          value={formData.apiSecret}
                          onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
                          placeholder="أدخل المفتاح السري"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                          onClick={() => setStep('consent')}
                        >
                          رجوع
                        </button>
                        <button
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition-colors"
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
                // Non-PREMIUM Modal
                <div className="space-y-4">
                  <div className="text-gray-300">
                    <p>ستتم ترقية اشتراكك إلى <strong>{tier.name}</strong>.</p>
                    <p className="mt-2 text-sm text-gray-400">
                      السعر: <strong>${tier.price}/شهر</strong>
                    </p>
                  </div>

                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500">
                    <p className="text-sm text-blue-300">
                      💡 ستتضمن خطتك الجديدة الميزات التالية:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-300">
                      <li>✓ {tier.features.maxSymbols === -1 ? 'أسهم غير محدودة' : `حتى ${tier.features.maxSymbols} سهم`}</li>
                      <li>✓ تحديث {tier.features.updateInterval === 'realtime' ? 'لحظي' : tier.features.updateInterval === 'hourly' ? 'كل ساعة' : 'يومي'}</li>
                      {tier.features.sentimentAnalysis && <li>✓ تحليل المشاعر</li>}
                      {tier.features.lstmModel && <li>✓ نموذج LSTM</li>}
                      {tier.features.transformerModel && <li>✓ نموذج Transformer</li>}
                      {tier.features.advancedCharts && <li>✓ رسوم بيانية متقدمة</li>}
                      {tier.features.pushNotifications && <li>✓ تنبيهات فورية</li>}
                      {tier.features.customStrategies && <li>✓ استراتيجيات مخصصة</li>}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      إلغاء
                    </button>
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? 'جاري الترقية...' : 'تأكيد الترقية'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UpgradeModal;
