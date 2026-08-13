import React from 'react';
import TermsAndConditions from './components/TermsAndConditions.tsx';
import SubscriptionPage from './pages/Subscription/SubscriptionPage.tsx';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'terms'>('subscription');

  return (
    <div className="App" style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* شريط التنقل العلوي */}
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
            fontWeight: 'bold',
            fontSize: '1rem'
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
            fontSize: '1rem'
          }}
        >
          الشروط والأحكام
        </button>
      </nav>

      {/* عرض الصفحة المحددة */}
      <main>
        {activeTab === 'subscription' && <SubscriptionPage />}
        {activeTab === 'terms' && <TermsAndConditions />}
      </main>

    </div>
  );
}

export default App;
