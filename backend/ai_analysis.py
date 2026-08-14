from __future__ import annotations

from typing import Any


def _trend(score: float) -> str:
    if score >= 75:
        return "صاعد قوي"
    if score >= 60:
        return "صاعد"
    if score >= 45:
        return "محايد"
    return "ضعيف"


def analyze_stock(technical: dict[str, Any], liquidity: dict[str, Any], momentum: dict[str, Any], ranking: dict[str, Any], quote: dict[str, Any] | None = None) -> dict[str, Any]:
    score = float(ranking.get("score", 0) or 0)
    technical_score = float(technical.get("technical_score", 0) or 0)
    liquidity_score = float(liquidity.get("score", 0) or 0)
    momentum_score = float(momentum.get("score", 0) or 0)
    indicators = technical.get("indicators", {}) or {}
    signals = technical.get("signals", {}) or {}
    positives: list[str] = []
    risks: list[str] = []
    if technical_score >= 60: positives.append("التحليل الفني يدعم الاتجاه الحالي")
    else: risks.append("التحليل الفني يحتاج إلى تأكيد")
    if liquidity_score >= 60: positives.append("السيولة مناسبة")
    else: risks.append("السيولة أقل من المستوى المفضل")
    if momentum_score >= 60: positives.append("الزخم إيجابي")
    else: risks.append("الزخم ضعيف أو غير مؤكد")
    if signals.get("breakout_60d"): positives.append("يوجد اختراق للنطاق الأخير")
    if signals.get("golden_cross"): positives.append("يوجد Golden Cross")
    rsi = indicators.get("rsi14")
    if isinstance(rsi, (int, float)):
        if rsi > 70: risks.append("RSI مرتفع وقد يعكس تشبعًا شرائيًا")
        elif rsi < 30: risks.append("RSI منخفض وقد يعكس تشبعًا بيعيًا")
    if score >= 80: recommendation = "strong_watch"
    elif score >= 65: recommendation = "bullish_watch"
    elif score >= 45: recommendation = "neutral"
    else: recommendation = "weak"
    return {"score": round(score, 2), "trend": _trend(score), "recommendation": recommendation, "positives": positives, "risks": risks, "summary": f"التقييم الكمي للسهم {score:.1f}/100. هذا تحليل آلي وليس نصيحة مالية.", "signals": signals, "rsi14": rsi}
