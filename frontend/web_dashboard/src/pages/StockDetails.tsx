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
  const indicators = technical.indicators || {};
  const signals = technical.signals || {};
  const change = Number(q.change_percent || 0);
  const aiScore = Number(ai.score || 0);
  const opportunityScore = Number(opportunity.score || 0);
  const opportunityComponents = opportunity.components || {};

  const opportunityClass =
    opportunityScore >= 85 ? 'opportunity-strong' :
    opportunityScore >= 75 ? 'opportunity-good' :
    opportunityScore >= 60 ? 'opportunity-watch' :
    'opportunity-neutral';

  return (
    <section className="stock-details">
      <div className="stock-details__header">
        <button onClick={() => window.history.back()}>عودة</button>
        <div><h1>{symbol}</h1><span className="detail-muted">تحليل كمي واكتشاف الفرص</span></div>
      </div>

      <article className="detail-card detail-card--hero"><StockChart history={data.history || []} /></article>

      <div className="stock-details__grid">
        <article className={`detail-card detail-card--hero opportunity-panel ${opportunityClass}`}>
          <div className="opportunity-header">
            <div>
              <h3>درجة اكتشاف الفرصة</h3>
              <p>{opportunity.display_label || 'محايد'}</p>
            </div>
            <div className="opportunity-score">{opportunityScore.toFixed(1)}<small>/100</small></div>
          </div>
          <div className="opportunity-components">
            <span>Technical <b>{Number(opportunityComponents.technical || 0).toFixed(0)}</b></span>
            <span>Liquidity <b>{Number(opportunityComponents.liquidity || 0).toFixed(0)}</b></span>
            <span>Momentum <b>{Number(opportunityComponents.momentum || 0).toFixed(0)}</b></span>
            <span>Breakout <b>{Number(opportunityComponents.breakout || 0).toFixed(0)}</b></span>
            <span>Rel. Volume <b>{Number(opportunityComponents.relative_volume || 0).toFixed(0)}</b></span>
          </div>
          {(opportunity.reasons || []).length > 0 && (
            <div className="opportunity-list">
              <b>عوامل القوة</b>
              <ul>{opportunity.reasons.map((item: string, i: number) => <li key={i}>✓ {item}</li>)}</ul>
            </div>
          )}
          {(opportunity.warnings || []).length > 0 && (
            <div className="opportunity-list warnings">
              <b>تنبيهات</b>
              <ul>{opportunity.warnings.map((item: string, i: number) => <li key={i}>⚠ {item}</li>)}</ul>
            </div>
          )}
        </article>

        <article className="detail-card detail-card--hero"><h3>التقييم الكمي</h3><div className="detail-value">{Number(r.score || 0).toFixed(1)} / 100</div><p>{r.label || 'لا يوجد تصنيف'}</p></article>
        <article className="detail-card"><h3>السعر</h3><div className="detail-value">${Number(q.price || 0).toFixed(2)}</div><div className={change >= 0 ? 'detail-positive' : 'detail-negative'}>{change.toFixed(2)}%</div></article>
        <article className="detail-card"><h3>Technical</h3><div className="detail-value">{Number(technical.technical_score || 0).toFixed(0)}</div><p className="detail-muted">RSI: {Number(indicators.rsi14 || 0).toFixed(1)}</p><p className="detail-muted">SMA20: {indicators.sma20 ? Number(indicators.sma20).toFixed(2) : '—'} | SMA50: {indicators.sma50 ? Number(indicators.sma50).toFixed(2) : '—'} | SMA200: {indicators.sma200 ? Number(indicators.sma200).toFixed(2) : '—'}</p></article>
        <article className="detail-card"><h3>Liquidity</h3><div className="detail-value">{Number(data.liquidity?.score || 0).toFixed(0)}</div></article>
        <article className="detail-card"><h3>Momentum</h3><div className="detail-value">{Number(data.momentum?.score || 0).toFixed(0)}</div></article>
        <article className="detail-card"><h3>Signals</h3><p>Breakout: {signals.breakout_60d ? 'نعم' : 'لا'}</p><p>Golden Cross: {signals.golden_cross ? 'نعم' : 'لا'}</p><p>Relative Volume: {indicators.relative_volume20 ? `${Number(indicators.relative_volume20).toFixed(2)}x` : '—'}</p></article>
        <article className="detail-card detail-card--hero ai-panel"><h3>🤖 AI Analysis</h3><div className="detail-value">{aiScore.toFixed(1)} / 100</div><p><b>الاتجاه:</b> {ai.trend || '—'}</p><p><b>التوصية:</b> {ai.recommendation || '—'}</p><p>{ai.summary || 'لا يوجد ملخص'}</p><div><b>العوامل الإيجابية</b>{(ai.positives || []).length ? <ul>{ai.positives.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul> : <p className="detail-muted">لا توجد عوامل إيجابية مسجلة.</p>}</div><div><b>المخاطر</b>{(ai.risks || []).length ? <ul>{ai.risks.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul> : <p className="detail-muted">لا توجد مخاطر إضافية مسجلة.</p>}</div></article>
        <NewsPanel news={data.news || []} />
      </div>
    </section>
  );
}
