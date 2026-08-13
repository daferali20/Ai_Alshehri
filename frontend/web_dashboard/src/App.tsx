import React, { useState } from 'react';
import LandingPage from './pages/LandingPage/LandingPage';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import TermsAndConditions from './components/TermsAndConditions';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'subscription' | 'terms'>('home');

  return (
    <div className="App" style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* شريط التنقل العلوي */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid #222', background: '#111' }}>
        <button
          onClick={() => setActiveTab('home')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'home' ? '#3b82f6' : '#1f2937',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          الرئيسية
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'subscription' ? '#3b82f6' : '#1f2937',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
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
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          الشروط والأحكام
        </button>
      </nav>

      {/* عرض الصفحة النشطة */}
      <main style={{ padding: '20px' }}>
        {activeTab === 'home' && (
          <LandingPage onNavigateToSubscription={() => setActiveTab('subscription')} />
        )}
        {activeTab === 'subscription' && <SubscriptionPage />}
        {activeTab === 'terms' && <TermsAndConditions />}
      </main>

    </div>
  );
}

export default App;
