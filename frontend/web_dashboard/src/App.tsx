import React, { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import StockDetails from './pages/StockDetails';
import TermsAndConditions from './components/TermsAndConditions';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'terms'>('home');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedSymbol(null);
      setActiveTab('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goHome = () => {
    setActiveTab('home');
    setSelectedSymbol(null);
  };

  const openStock = (symbol: string) => {
    window.history.pushState({ stock: symbol }, '', window.location.href);
    setActiveTab('home');
    setSelectedSymbol(symbol);
  };

  return (
    <div className="App" dir="rtl">
      <nav className="nav">
        <strong>Ai_Alshehri</strong>
        <div>
          <button className={activeTab === 'home' ? 'nav-active' : ''} onClick={goHome}>لوحة التحكم</button>
          <button className={activeTab === 'terms' ? 'nav-active' : ''} onClick={() => { setActiveTab('terms'); setSelectedSymbol(null); }}>الشروط والأحكام</button>
        </div>
      </nav>
      <main>
        {activeTab === 'terms' ? <TermsAndConditions /> : selectedSymbol ? <StockDetails symbol={selectedSymbol} /> : <Dashboard onSelect={openStock} />}
      </main>
    </div>
  );
}

export default App;
