import React, { useState } from 'react';
import LandingPage from './pages/LandingPage/LandingPage';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import TermsAndConditions from './components/TermsAndConditions';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'subscription' | 'terms'>('home');

  return (
    
      
      {/* شريط التنقل العلوي */}
      
         setActiveTab('home')}
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
        

         setActiveTab('subscription')}
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
        

         setActiveTab('terms')}
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
        
      

      {/* عرض الصفحة النشطة */}
      
        {activeTab === 'home' && (
           setActiveTab('subscription')} />
        )}
        {activeTab === 'subscription' && }
        {activeTab === 'terms' && }
      

    
  );
}

export default App;
