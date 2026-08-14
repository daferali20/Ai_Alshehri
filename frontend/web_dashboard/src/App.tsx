import React, { useState } from 'react';
import TermsAndConditions from './components/TermsAndConditions';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'terms'>('home');

  return (
    
      
         setActiveTab('home')}
          style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'home' ? '#3b82f6' : '#1f2937', color: '#fff', cursor: 'pointer' }}
        >
          الرئيسية
        
         setActiveTab('terms')}
          style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'terms' ? '#3b82f6' : '#1f2937', color: '#fff', cursor: 'pointer' }}
        >
          الشروط والأحكام
        
      

      
        {activeTab === 'home' && مرحباً بك في المنصة}
        {activeTab === 'terms' && }
      
    
  );
}

export default App;
