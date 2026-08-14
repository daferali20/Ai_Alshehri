import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import StockDetails from './pages/StockDetails';
import TermsAndConditions from './components/TermsAndConditions';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'terms'>('home');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  return <div className="App" dir="rtl"><nav className="nav"><strong>Ai_Alshehri</strong><div><button className={activeTab==='home'?'nav-active':''} onClick={()=>{setActiveTab('home');setSelectedSymbol(null)}}>لوحة التحكم</button><button className={activeTab==='terms'?'nav-active':''} onClick={()=>setActiveTab('terms')}>الشروط والأحكام</button></div></nav><main>{activeTab==='terms'?<TermsAndConditions/>:selectedSymbol?<StockDetails symbol={selectedSymbol}/>:<Dashboard onSelect={setSelectedSymbol}/>}</main></div>;
}
export default App;
