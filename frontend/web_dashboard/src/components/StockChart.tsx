import React, { useMemo } from 'react';

type Point = { time?: string; date?: string; close?: number; volume?: number };

export default function StockChart({ history = [] }: { history?: Point[] }) {
  const values = useMemo(() => history.map(p => Number(p.close)).filter(Number.isFinite).slice(-120), [history]);
  if (!values.length) return <div className="chart-empty">لا توجد بيانات تاريخية للرسم البياني</div>;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const points = values.map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 100},${100 - ((v - min) / range) * 90}`).join(' ');
  return <div className="chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="سعر السهم"><polyline fill="none" stroke="currentColor" strokeWidth="0.8" points={points} /></svg><div className="chart-labels"><span>${min.toFixed(2)}</span><span>${max.toFixed(2)}</span></div></div>;
}
