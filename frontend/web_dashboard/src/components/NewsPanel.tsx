import React from 'react';

type NewsItem={headline?:string;source?:string;url?:string;sentiment?:'positive'|'neutral'|'negative';published_at?:number|string};
export default function NewsPanel({news=[]}:{news?:NewsItem[]}){
 const counts=news.reduce((a,n)=>{const s=n.sentiment||'neutral';a[s]++;return a},{positive:0,neutral:0,negative:0});
 const total=news.length||1;
 return <section className="news-panel"><div className="news-header"><h3>📰 آخر الأخبار</h3><span>{news.length} خبر</span></div><div className="sentiment-summary"><span>🟢 إيجابي {Math.round(counts.positive/total*100)}%</span><span>🟡 محايد {Math.round(counts.neutral/total*100)}%</span><span>🔴 سلبي {Math.round(counts.negative/total*100)}%</span></div>{news.length?<div className="news-list">{news.map((item,i)=><a className="news-item" href={item.url||'#'} target="_blank" rel="noreferrer" key={`${item.url||item.headline||'news'}-${i}`}><div><strong>{item.headline||'خبر بدون عنوان'}</strong><p className="detail-muted">{item.source||'مصدر غير معروف'} · {item.sentiment||'neutral'}</p></div><span>↗</span></a>)}</div>:<p className="detail-muted">لا توجد أخبار متاحة حاليًا.</p>}</section>;
}
