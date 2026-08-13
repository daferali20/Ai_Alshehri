import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import SubscriptionPage from './pages/Subscription'; // تم التعديل للاستيراد المباشر من المجلد
import TermsAndConditions from './components/TermsAndConditions';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'subscription' | 'terms'>('home');

  return (
    <div className="App" style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* شريط التنقل */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid #222' }}>
        <button
          onClick={() => setActiveTab('home')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'home' ? '#3b82f6' : '#1f2937',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          الرئيسية
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'subscription' ? '#3b82f6' : '#1f2937',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          خطط الاشتراكات
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'terms' ? '#3b82f6' : '#1f2937',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          الشروط والأحكام
        </button>
      </nav>

      {/* عرض المحتوى */}
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
