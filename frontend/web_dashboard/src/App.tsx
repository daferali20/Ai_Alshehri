import React, { useState } from 'react';
import TermsAndConditions from './components/TermsAndConditions';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'terms'>('home');

  return (
    <div className="App" style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', direction: 'rtl' }}>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid #222' }}>
        <button
          onClick={() => setActiveTab('home')}
          style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'home' ? '#3b82f6' : '#1f2937', color: '#fff', cursor: 'pointer' }}
        >
          الرئيسية
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'terms' ? '#3b82f6' : '#1f2937', color: '#fff', cursor: 'pointer' }}
        >
          الشروط والأحكام
        </button>
      </nav>

      <main style={{ padding: '20px' }}>
        {activeTab === 'home' && <h1>مرحباً بك في المنصة</h1>}
        {activeTab === 'terms' && <TermsAndConditions />}
      </main>
    </div>
  );
}

export default App;
