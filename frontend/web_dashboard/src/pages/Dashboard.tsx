import React, { useEffect, useState } from 'react';
import { tradingApi, getTradingApiError } from '../services/api/tradingApi';

const modes = [
  ['opportunities', 'الفرص'],
  ['most-active', 'الأكثر نشاطًا'],
  ['top-gainers', 'الأكثر ارتفاعًا'],
  ['volume-surge', 'تدفق السيولة'],
  ['breakouts', 'اختراقات'],
  ['golden-cross', 'Golden Cross'],
  ['momentum', 'زخم'],
  ['liquidity', 'سيولة'],
];

function scoreClass(score: number): string {
  if (score >= 85) return 'score-strong';
  if (score >= 75) return 'score-good';
  if (score >= 60) return 'score-watch';
  return 'score-neutral';
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'فرصة قوية';
  if (score >= 75) return 'فرصة جيدة';
  if (score >= 60) return 'مراقبة';
  return 'محايد';
}

export default function Dashboard({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [mode, setMode] = useState('opportunities');
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

  const isOpportunityMode = mode === 'opportunities';

  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <span className="eyebrow">AI ALSHEHRI</span>
        <h1>لوحة تحليل الأسهم الأمريكية</h1>
        <p>اكتشاف الفرص باستخدام التحليل الفني والسيولة والزخم والاختراقات.</p>
      </header>

      <div className="mode-tabs">
        {modes.map(([id, label]) => (
          <button className={mode === id ? 'active' : ''} key={id} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="state">جاري تحليل الأسهم...</div>}
      {error && <div className="state error">{error}</div>}

      {!loading && !error && rows.length === 0 && (
        <div className="state">
          لا توجد نتائج حاليًا لهذا الفلتر. سيتم تحديث النتائج مع تغير بيانات السوق.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="stock-grid">
          {rows.map((row) => {
            const opportunityScore = Number(row.opportunity?.score ?? 0);
            const rankingScore = Number(row.ranking?.score ?? 0);
            const displayScore = isOpportunityMode ? opportunityScore : rankingScore;

            return (
              <article className="stock-card" key={row.symbol} onClick={() => onSelect(row.symbol)}>
                <div className="stock-top">
                  <strong>{row.symbol}</strong>
                  <span className={isOpportunityMode ? scoreClass(opportunityScore) : ''}>
                    {displayScore.toFixed(1)}
                  </span>
                </div>

                <div className="price">${Number(row.quote?.price ?? 0).toFixed(2)}</div>
                <div className={Number(row.quote?.change_percent ?? 0) >= 0 ? 'change' : 'change negative'}>
                  {Number(row.quote?.change_percent ?? 0).toFixed(2)}%
                </div>

                {isOpportunityMode && (
                  <div className={`opportunity-badge ${scoreClass(opportunityScore)}`}>
                    {scoreLabel(opportunityScore)}
                  </div>
                )}

                <div className="metrics">
                  <span>Technical<br /><b>{Number(row.technical?.technical_score ?? 0).toFixed(0)}</b></span>
                  <span>Liquidity<br /><b>{Number(row.liquidity?.score ?? 0).toFixed(0)}</b></span>
                  <span>Momentum<br /><b>{Number(row.momentum?.score ?? 0).toFixed(0)}</b></span>
                </div>

                {isOpportunityMode && (
                  <div className="opportunity-reasons">
                    {(row.opportunity?.reasons ?? []).slice(0, 3).map((reason: string, index: number) => (
                      <span key={index}>✓ {reason}</span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
