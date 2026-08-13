import React, { useState } from 'react';
// لاحظ كيف أصبحت أسطر الاستيراد قصيرة ومباشرة بدون أسماء الملفات الداخلية!
import { SubscriptionPage } from './pages/Subscription';
import { TermsAndConditions } from './components';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'terms'>('subscription');

  return (
    <div className="App" style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', direction: 'rtl' }}>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px 0', borderBottom: '1px solid #222' }}>
        <button 
          onClick={() => setActiveTab('subscription')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'subscription' ? '#3b82f6' : '#1f2937',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          خطط الاشتراكات
        </button>

        <button 
          onClick={() => setActiveTab('terms')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'terms' ? '#3b82f6' : '#1f2937',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          الشروط والأحكام
        </button>
      </nav>

      <main style={{ padding: '20px' }}>
        {activeTab === 'subscription' && <SubscriptionPage />}
        {activeTab === 'terms' && <TermsAndConditions />}
      </main>
    </div>
  );
}

export default App;
