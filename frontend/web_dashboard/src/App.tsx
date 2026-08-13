import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import TermsAndConditions from './components/TermsAndConditions';
import LandingPage from './pages/LandingPage'; // افترضنا وجود صفحة البداية هنا
import './App.css';

// مكون شريط التنقل العلوي
const NavigationBar: React.FC = () => {
  const location = useLocation();

  const navButtonStyle = (path: string) => ({
    padding: '10px 20px',
    borderRadius: '8px',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
    backgroundColor: location.pathname === path ? '#3b82f6' : '#1f2937',
    transition: 'background-color 0.2s ease',
  });

  return (
    <nav style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px 0', borderBottom: '1px solid #222' }}>
      <Link to="/" style={navButtonStyle('/')}>
        الرئيسية
      </Link>
      <Link to="/subscription" style={navButtonStyle('/subscription')}>
        خطط الاشتراكات
      </Link>
      <Link to="/terms" style={navButtonStyle('/terms')}>
        الشروط والأحكام
      </Link>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="App" style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', direction: 'rtl' }}>
        {/* شريط التنقل العلوي */}
        <NavigationBar />

        {/* مسارات الصفحات */}
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            {/* توجيه أي مسار غير معروف إلى الرئيسية */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
