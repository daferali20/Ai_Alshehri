import React from 'react';

interface LandingPageProps {
  onNavigateToSubscription?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToSubscription }) => {
  return (
    <div style={{ color: '#fff', maxWidth: '1200px', margin: '0 auto', padding: '20px 15px' }}>
      
      {/* 1. قسم الواجهة الرئيسي (Hero Section) */}
      <section style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#141414', borderRadius: '16px', border: '1px solid #222', marginBottom: '40px' }}>
        <span style={{ background: '#1e293b', color: '#3b82f6', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold' }}>
          🚀 الجيل القادم من التداول الذكي
        </span>
        
        <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '15px', lineHeight: '1.2' }}>
          اتخذ قرارات تداول أدق مع <br />
          <span style={{ color: '#3b82f6' }}>نماذج الذكاء الاصطناعي المتقدمة</span>
        </h1>
        
        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 30px', lineHeight: '1.6' }}>
          نظام تحليلي متكامل يعتمد على نماذج <strong>LSTM</strong> و <strong>Transformer</strong> لتحليل حركة الأسواق، مع دعم التحليل اللحظي للمشاعر والتنفيذ التلقائي عبر الـ API.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={onNavigateToSubscription}
            style={{
              padding: '14px 32px',
              fontSize: '1.05rem',
              fontWeight: 'bold',
              color: '#fff',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              transition: 'transform 0.2s ease',
            }}
          >
            استعرض خطط الاشتراكات ⚡
          </button>
        </div>
      </section>

      {/* 2. قسم المميزات الرئيسية (Features Grid) */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '35px', fontSize: '1.8rem', color: '#f8fafc' }}>
          ما الذي يميّز المنصة؟
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          
          {/* ميزة 1 */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>🧠</div>
            <h3 style={cardTitleStyle}>نماذج للتوقع (LSTM & Transformer)</h3>
            <p style={cardTextStyle}>
              تحليل اتجاهات الأسهم والتنبؤ بالأسعار بناءً على خوارزميات التعلّم العميق وتتبع الأنماط السعرية التاريخية.
            </p>
          </div>

          {/* ميزة 2 */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>📊</div>
            <h3 style={cardTitleStyle}>تحليل مشاعر السوق (Sentiment Analysis)</h3>
            <p style={cardTextStyle}>
              معالجة الأخبار والتقارير المالية للحصول على مؤشر لحظي لمعنويات المتداولين واتجاهات السوق.
            </p>
          </div>

          {/* ميزة 3 */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>⚡</div>
            <h3 style={cardTitleStyle}>التنفيذ التلقائي للطلبات</h3>
            <p style={cardTextStyle}>
              ربط مباشر وآمن مع الوسيط المالي لتنفيذ استراتيجياتك وتوصيات الذكاء الاصطناعي دون تدخل يدوي.
            </p>
          </div>

          {/* ميزة 4 */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>📈</div>
            <h3 style={cardTitleStyle}>تحديثات لحظية ورسوم متقدمة</h3>
            <p style={cardTextStyle}>
              تتبع حركة الأسهم لحظة بلحظة مع مؤشرات فنية وتنبيهات فورية عند تحقق الفرص المباشرة.
            </p>
          </div>

        </div>
      </section>

      {/* 3. قسم الدعوة للترقية (CTA Banner) */}
      <section style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', padding: '40px 30px', borderRadius: '16px', border: '1px solid #312e81', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>جاهز لبدء التداول الذكي؟</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '25px', fontSize: '1rem' }}>
          اختر الخطة المناسبة لاحتياجاتك واستفد من أحدث أوات الذكاء الاصطناعي اليوم.
        </p>
        <button
          onClick={onNavigateToSubscription}
          style={{
            padding: '12px 28px',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#1e1b4b',
            backgroundColor: '#38bdf8',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          انتقل إلى قائمة الأسعار 🏷️
        </button>
      </section>

    </div>
  );
};

// الأنماط المشتركة للبطاقات (Inline Styles)
const cardStyle: React.CSSProperties = {
  backgroundColor: '#141414',
  border: '1px solid #262626',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'right',
};

const iconContainerStyle: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '12px',
  display: 'inline-block',
  background: '#1f2937',
  padding: '10px',
  borderRadius: '10px',
};

const cardTitleStyle: React.CSSProperties = {
  color: '#3b82f6',
  fontSize: '1.15rem',
  marginBottom: '8px',
};

const cardTextStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '0.9rem',
  lineHeight: '1.5',
};

export default LandingPage;
