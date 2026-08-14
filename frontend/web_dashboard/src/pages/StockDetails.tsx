import React, { useEffect, useState } from 'react';
import { tradingApi } from '../services/api/tradingApi';
import './StockDetails.css';

export default function StockDetails({ symbol }: { symbol: string }) {
  const [data, setData] = useState<any>(null); const [error, setError] = useState('');
  useEffect(() => { setData(null); setError(''); tradingApi.stock(symbol).then(setData).catch(() => setError('تعذر تحميل بيانات السهم')); }, [symbol]);
  if (error) return <div className="detail-error">{error}</div>;
  if (!data) return <div className="state">جاري تحميل {symbol}...</div>;
  const q = data.quote || {}, r = data.ranking || {}, change = Number(q.change_percent || 0), indicators = data.technical?.indicators || {};
  return <section className="stock-details"><div className="stock-details__header"><button onClick={() => window.history.back()}>عودة</button><div><h1>{symbol}</h1><span className="detail-muted">تحليل كمي للسهم</span></div></div><div className="stock-details__grid"><article className="detail-card detail-card--hero"><h3>التقييم النهائي</h3><div className="detail-value">{Number(r.score || 0).toFixed(1)} / 100</div><p>{r.label || 'لا يوجد تصنيف'}</p></article><article className="detail-card"><h3>السعر</h3><div className="detail-value">${Number(q.price || 0).toFixed(2)}</div><div className={change >= 0 ? 'detail-positive' : 'detail-negative'}>{change.toFixed(2)}%</div></article><article className="detail-card"><h3>Technical</h3><div className="detail-value">{Number(data.technical?.technical_score || 0).toFixed(0)}</div><p className="detail-muted">RSI: {Number(indicators.rsi || 0).toFixed(1)}</p></article><article className="detail-card"><h3>Liquidity</h3><div className="detail-value">{Number(data.liquidity?.score || 0).toFixed(0)}</div></article><article className="detail-card"><h3>Momentum</h3><div className="detail-value">{Number(data.momentum?.score || 0).toFixed(0)}</div></article><article className="detail-card"><h3>Signals</h3><p>Breakout: {data.technical?.signals?.breakout_60d ? 'نعم' : 'لا'}</p><p>Golden Cross: {data.technical?.signals?.golden_cross ? 'نعم' : 'لا'}</p></article></div></section>;
}
