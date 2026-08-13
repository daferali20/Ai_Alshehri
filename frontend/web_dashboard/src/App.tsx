import React from 'react';
import TermsAndConditions from './components/TermsAndConditions';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import './App.css';

function App() {
  return (
    <div className="App" style={{ padding: '20px', direction: 'rtl' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>منصة الذكاء الاصطناعي - لوحة التحكم</h1>
        <p>مرحباً بك في لوحة تحكم Ai Alshehri</p>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* صفحة/مكون الاشتراكات */}
        <section>
          <SubscriptionPage />
        </section>

        {/* مكون الشروط والأحكام */}
        <section>
          <TermsAndConditions />
        </section>
      </main>
    </div>
  );
}

export default App;
