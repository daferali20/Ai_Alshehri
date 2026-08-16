import React, { useEffect, useState } from 'react';
import { tradingApi, getTradingApiError } from '../services/api/tradingApi';

const modes = [['most-active','الأكثر نشاطًا'],['top-gainers','الأكثر ارتفاعًا'],['volume-surge','تدفق سيولة'],['breakouts','اختراقات'],['golden-cross','Golden Cross'],['momentum','زخم'],['liquidity','سيولة']];

export default function Dashboard({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [mode, setMode] = useState('most-active');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    tradingApi.screener(mode, 20)
      .then((data) => {
        if (!cancelled) setRows(Array.isArray(data.results) ? data.results : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getTradingApiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  return <section className="dashboard"><header className="dashboard-header"><span className="eyebrow">AI ALSHEHRI</span><h1>لوحة تحليل الأسهم الأمريكية</h1><p>ترتيب كمي يجمع التحليل الفني والسيولة والزخم.</p></header><div className="mode-tabs">{modes.map(([id,label]) => <button className={mode===id?'active':''} key={id} onClick={()=>setMode(id)}>{label}</button>)}</div>{loading&&<div className="state">جاري تحليل الأسهم...</div>}{error&&<div className="state error">{error}</div>}{!loading&&!error&&<div className="stock-grid">{rows.map(row=><article className="stock-card" key={row.symbol} onClick={()=>onSelect(row.symbol)}><div className="stock-top"><strong>{row.symbol}</strong><span>{Number(row.ranking?.score||0).toFixed(1)}</span></div><div className="price">${Number(row.quote?.price||0).toFixed(2)}</div><div className="change">{Number(row.quote?.change_percent||0).toFixed(2)}%</div><div className="metrics"><span>Technical<br/><b>{Number(row.technical?.technical_score||0).toFixed(0)}</b></span><span>Liquidity<br/><b>{Number(row.liquidity?.score||0).toFixed(0)}</b></span><span>Momentum<br/><b>{Number(row.momentum?.score||0).toFixed(0)}</b></span></div></article>)}</div>}</section>;
}
