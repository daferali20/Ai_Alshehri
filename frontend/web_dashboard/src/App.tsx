import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TermsAndConditions from './components/TermsAndConditions';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'terms'>('home');
  return <div className="App" dir="rtl"><nav className="nav"><strong>Ai_Alshehri</strong><div><button className={activeTab==='home'?'nav-active':''} onClick={()=>setActiveTab('home')}>لوحة التحكم</button><button className={activeTab==='terms'?'nav-active':''} onClick={()=>setActiveTab('terms')}>الشروط والأحكام</button></div></nav><main>{activeTab==='home'?<Dashboard/>:<TermsAndConditions/>}</main></div>;
}
export default App;
