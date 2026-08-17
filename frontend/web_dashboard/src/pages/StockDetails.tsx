import React, { useEffect, useState } from 'react';
import { tradingApi } from '../services/api/tradingApi';
import StockChart from '../components/StockChart';
import NewsPanel from '../components/NewsPanel';
import './StockDetails.css';

type StockDetailsProps = { symbol: string };

export default function StockDetails({ symbol }: StockDetailsProps) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    tradingApi.stock(symbol)
      .then(result => { if (active) setData(result); })
      .catch(() => { if (active) setError('تعذر تحميل بيانات السهم'); });
    return () => { active = false; };
  }, [symbol]);

  if (error) return <div className="detail-error">{error}</div>;
  if (!data) return <div className="state">جاري تحميل {symbol}...</div>;

  const q = data.quote || {};
  const r = data.ranking || {};
  const opportunity = data.opportunity || {};
  const ai = data.ai_analysis || {};
  const technical = data.technical || {};
  const liquidity = data.liquidity || {};
  const momentum = data.momentum || {};
  const indicators = technical.indicators || {};
  const signals = technical.signals || {};
  const change = Number(q.change_percent || 0);
  const aiScore = Number(ai.score || 0);
  const opportunityScore = Number(opportunity.score || 0);
  const opportunityComponents = opportunity.components || {};
  const news = data.news || [];

  const opportunityClass =
    opportunityScore >= 85 ? 'opportunity-strong' :
    opportunityScore >= 75 ? 'opportunity-good' :
    opportunityScore >= 60 ? 'opportunity-watch' :
    'opportunity-neutral';

  const scoreLabel = opportunity.display_label || (
    opportunityScore >= 85 ? 'فرصة استثنائية' :
    opportunityScore >= 75 ? 'فرصة قوية' :
    opportunityScore >= 60 ? 'فرصة للمراقبة' : 'محايد'
  );

  const scoreStyle = { '--score': `${Math.max(0, Math.min(100, opportunityScore)) * 3.6}deg` } as React.CSSProperties;
  const newsPositive = news.filter((n: any) => String(n.sentiment || '').toLowerCase().includes('positive') || n.sentiment === 'إيجابي').length;
  const newsNegative = news.filter((n: any) => String(n.sentiment || '').toLowerCase().includes('negative') || n.sentiment === 'سلبي').length;
  const newsNeutral = Math.max(0, news.length - newsPositive - newsNegative);

  return (
    <section className="stock-details" dir="rtl">
      <div className="stock-details__header">
        <button className="back-button" onClick={() => window.history.back()} aria-label="العودة">← العودة</button>
        <div className="stock-title">
          <div className="stock-symbol-row">
            <h1>{symbol}</h1>
            <span className="live-badge">● LIVE</span>
          </div>
          <span className="detail-muted">مركز التحليل الكمي واكتشاف الفرص</span>
        </div>
        <div className="header-price">
          <strong>${Number(q.price || 0).toFixed(2)}</strong>
          <span className={change >= 0 ? 'detail-positive' : 'detail-negative'}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
        </div>
      </div>

      <div className="market-summary">
        <div><span>الافتتاح</span><b>${Number(q.open || 0).toFixed(2)}</b></div>
        <div><span>الأعلى</span><b>${Number(q.high || 0).toFixed(2)}</b></div>
        <div><span>الأدنى</span><b>${Number(q.low || 0).toFixed(2)}</b></div>
        <div><span>السابق</span><b>${Number(q.previous_close || 0).toFixed(2)}</b></div>
        <div><span>الحجم</span><b>{Number(q.volume || 0).toLocaleString()}</b></div>
      </div>

      <article className="detail-card chart-card">
        <div className="section-heading"><div><span className="eyebrow">PRICE ACTION</span><h2>حركة السهم</h2></div><span className="data-source">مصدر البيانات: {q.source || 'market data'}</span></div>
        <StockChart history={data.history || []} />
      </article>

      <div className="analysis-hero-grid">
        <article className={`detail-card opportunity-panel ${opportunityClass}`}>
          <div className="opportunity-main">
            <div className="score-ring" style={scoreStyle}><div><strong>{opportunityScore.toFixed(1)}</strong><span>/ 100</span></div></div>
            <div className="opportunity-copy">
              <span className="eyebrow">OPPORTUNITY RADAR</span>
              <h2>{scoreLabel}</h2>
              <p>درجة مركبة لاكتشاف الفرص، وليست توصية تداول.</p>
              <div className="status-pill">{opportunityScore >= 75 ? '● إشارة قوية للمراقبة' : opportunityScore >= 60 ? '● يحتاج متابعة' : '● انتظار تأكيد'}</div>
            </div>
          </div>
          <div className="component-grid">
            {[
              ['الفني', opportunityComponents.technical],
              ['السيولة', opportunityComponents.liquidity],
              ['الزخم', opportunityComponents.momentum],
              ['الاختراق', opportunityComponents.breakout],
              ['الحجم النسبي', opportunityComponents.relative_volume],
            ].map(([label, value]) => <div className="component-item" key={String(label)}><span>{label}</span><b>{Number(value || 0).toFixed(0)}</b><div className="mini-bar"><i style={{ width: `${Math.max(0, Math.min(100, Number(value || 0)))}%` }} /></div></div>)}
          </div>
        </article>

        <article className="detail-card confidence-card">
          <span className="eyebrow">QUANT RANKING</span>
          <h3>التقييم الكمي</h3>
          <div className="big-number">{Number(r.score || 0).toFixed(1)}<small>/100</small></div>
          <span className="rank-badge">{r.label || 'neutral'}</span>
          <p>يجمع التحليل الفني والسيولة والزخم ضمن نموذج كمي موحد.</p>
        </article>
      </div>

      <div className="metric-grid">
        <article className="detail-card metric-card"><span className="metric-icon">📊</span><span>Technical</span><strong>{Number(technical.technical_score || 0).toFixed(0)}</strong><small>RSI {Number(indicators.rsi14 || 0).toFixed(1)}</small></article>
        <article className="detail-card metric-card"><span className="metric-icon">💧</span><span>Liquidity</span><strong>{Number(liquidity.score || 0).toFixed(0)}</strong><small>{liquidity.liquidity_signal || '—'}</small></article>
        <article className="detail-card metric-card"><span className="metric-icon">🚀</span><span>Momentum</span><strong>{Number(momentum.score || 0).toFixed(0)}</strong><small>5D {Number(momentum.return_5d || 0).toFixed(2)}%</small></article>
        <article className="detail-card metric-card"><span className="metric-icon">⚡</span><span>Relative Volume</span><strong>{indicators.relative_volume20 ? `${Number(indicators.relative_volume20).toFixed(2)}x` : '—'}</strong><small>متوسط 20 يوم</small></article>
      </div>

      <div className="details-two-column">
        <article className="detail-card signals-card">
          <div className="section-heading"><div><span className="eyebrow">SIGNALS</span><h3>الإشارات الفنية</h3></div></div>
          <div className="signal-row"><span>اختراق 60 يوم</span><b className={signals.breakout_60d ? 'signal-on' : 'signal-off'}>{signals.breakout_60d ? '✓ مؤكد' : '— غير مؤكد'}</b></div>
          <div className="signal-row"><span>Golden Cross</span><b className={signals.golden_cross ? 'signal-on' : 'signal-off'}>{signals.golden_cross ? '✓ موجود' : '— غير موجود'}</b></div>
          <div className="signal-row"><span>السعر مقابل SMA20</span><b>{indicators.sma20 ? (Number(q.price) >= Number(indicators.sma20) ? 'فوق المتوسط' : 'تحت المتوسط') : '—'}</b></div>
          <div className="signal-row"><span>السعر مقابل SMA50</span><b>{indicators.sma50 ? (Number(q.price) >= Number(indicators.sma50) ? 'فوق المتوسط' : 'تحت المتوسط') : '—'}</b></div>
        </article>

        <article className="detail-card ai-panel">
          <div className="ai-header"><div><span className="eyebrow">AI INSIGHT</span><h3>🤖 التحليل الذكي</h3></div><span className="ai-score">{aiScore.toFixed(1)} / 100</span></div>
          <div className="ai-trend"><span>الاتجاه</span><b>{ai.trend || '—'}</b><span>الحالة</span><b>{ai.recommendation || '—'}</b></div>
          <p className="ai-summary">{ai.summary || 'لا يوجد ملخص متاح.'}</p>
          <div className="ai-columns">
            <div><b className="positive-title">✓ العوامل الإيجابية</b>{(ai.positives || []).length ? <ul>{ai.positives.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul> : <p>لا توجد.</p>}</div>
            <div><b className="risk-title">⚠ المخاطر</b>{(ai.risks || []).length ? <ul>{ai.risks.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul> : <p>لا توجد.</p>}</div>
          </div>
        </article>
      </div>

      <article className="detail-card catalyst-card">
        <div className="section-heading"><div><span className="eyebrow">NEWS CATALYST</span><h3>📰 الأخبار المؤثرة</h3></div><span className="news-count">{news.length} أخبار</span></div>
        <div className="news-stats"><span>🟢 إيجابي <b>{news.length ? Math.round(newsPositive / news.length * 100) : 0}%</b></span><span>🟡 محايد <b>{news.length ? Math.round(newsNeutral / news.length * 100) : 0}%</b></span><span>🔴 سلبي <b>{news.length ? Math.round(newsNegative / news.length * 100) : 0}%</b></span></div>
        <NewsPanel news={news} />
      </article>

      <p className="analysis-disclaimer">التحليلات والدرجات آلية لأغراض المعلومات واكتشاف الفرص فقط، ولا تمثل نصيحة مالية أو توصية بالشراء أو البيع.</p>
    </section>
  );
}
