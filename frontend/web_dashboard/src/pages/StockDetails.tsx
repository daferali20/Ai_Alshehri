import React, { useEffect, useState } from 'react';
import { tradingApi } from '../services/api/tradingApi';

export default function StockDetails({ symbol }: { symbol: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { setError(''); tradingApi.stock(symbol).then(setData).catch(() => setError('تعذر تحميل بيانات السهم')); }, [symbol]);
  if (error) return <div className="state error">{error}</div>;
  if (!data) return <div className="state">جاري تحميل {symbol}...</div>;
  const q = data.quote || {}, r = data.ranking || {};
  return <section className="dashboard"><button onClick={() => window.history.back()}>عودة</button><div className="stock-card"><div className="stock-top"><strong>{symbol}</strong><span>{Number(r.score || 0).toFixed(1)}</span></div><div className="price">${Number(q.price || 0).toFixed(2)}</div><div className="change">{Number(q.change_percent || 0).toFixed(2)}%</div><div className="metrics"><span>Technical<br/><b>{Number(data.technical?.technical_score || 0).toFixed(0)}</b></span><span>Liquidity<br/><b>{Number(data.liquidity?.score || 0).toFixed(0)}</b></span><span>Momentum<br/><b>{Number(data.momentum?.score || 0).toFixed(0)}</b></span></div><p>{r.label}</p></div></section>;
}
