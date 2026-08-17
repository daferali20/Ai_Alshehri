from __future__ import annotations

from typing import Any


def _num(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _trend(score: float) -> str:
    if score >= 75:
        return "صاعد قوي"
    if score >= 60:
        return "صاعد"
    if score >= 45:
        return "محايد"
    return "ضعيف"


def analyze_stock(
    technical: dict[str, Any],
    liquidity: dict[str, Any],
    momentum: dict[str, Any],
    ranking: dict[str, Any],
    quote: dict[str, Any] | None = None,
    opportunity: dict[str, Any] | None = None,
    news: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Generate a transparent, deterministic AI-style explanation.

    This layer explains the quantitative engines; it does not place trades or
    claim certainty. External generative AI can be added later without
    changing the response contract.
    """
    quote = quote or {}
    opportunity = opportunity or {}
    news = news or []

    score = _num(opportunity.get("score"), _num(ranking.get("score")))
    technical_score = _num(technical.get("technical_score"))
    liquidity_score = _num(liquidity.get("score"))
    momentum_score = _num(momentum.get("score"))
    indicators = technical.get("indicators", {}) or {}
    signals = technical.get("signals", {}) or {}

    positives: list[str] = []
    risks: list[str] = []

    if technical_score >= 65:
        positives.append("القوة الفنية تدعم الاتجاه الحالي")
    else:
        risks.append("القوة الفنية تحتاج إلى تأكيد")

    if liquidity_score >= 70:
        positives.append("السيولة مرتفعة وتدعم قابلية المتابعة")
    elif liquidity_score < 50:
        risks.append("السيولة أقل من المستوى المفضل")

    if momentum_score >= 60:
        positives.append("الزخم إيجابي")
    elif momentum_score < 40:
        risks.append("الزخم ضعيف")

    if signals.get("breakout_60d"):
        positives.append("يوجد اختراق للنطاق الأخير")
    if signals.get("golden_cross"):
        positives.append("يوجد Golden Cross")

    opportunity_reasons = opportunity.get("reasons", []) or []
    for reason in opportunity_reasons[:3]:
        if reason not in positives:
            positives.append(str(reason))

    opportunity_warnings = opportunity.get("warnings", []) or []
    for warning in opportunity_warnings[:3]:
        if warning not in risks:
            risks.append(str(warning))

    news_data = opportunity.get("news", {}) or {}
    news_impact = _num(news_data.get("impact_score"), 50)
    positive_news = int(_num(news_data.get("positive"), 0))
    negative_news = int(_num(news_data.get("negative"), 0))

    if news_impact >= 70 and positive_news > negative_news:
        positives.append("يوجد محفز إخباري إيجابي مرتفع التأثير")
    elif news_impact >= 70 and negative_news > positive_news:
        risks.append("يوجد محفز إخباري سلبي مرتفع التأثير")

    rsi = indicators.get("rsi14")
    if isinstance(rsi, (int, float)):
        if rsi > 70:
            risks.append("RSI مرتفع وقد يعكس امتدادًا قصير الأجل")
        elif rsi < 30:
            risks.append("RSI منخفض وقد يعكس تشبعًا بيعيًا")

    if score >= 85:
        recommendation = "exceptional_watch"
        recommendation_ar = "فرصة استثنائية للمراقبة"
    elif score >= 80:
        recommendation = "strong_watch"
        recommendation_ar = "فرصة قوية للمراقبة"
    elif score >= 70:
        recommendation = "bullish_watch"
        recommendation_ar = "فرصة جيدة للمراقبة"
    elif score >= 60:
        recommendation = "watch"
        recommendation_ar = "مراقبة"
    elif score >= 45:
        recommendation = "neutral"
        recommendation_ar = "محايد"
    else:
        recommendation = "weak"
        recommendation_ar = "ضعيف"

    return {
        "score": round(score, 2),
        "trend": _trend(score),
        "recommendation": recommendation,
        "recommendation_ar": recommendation_ar,
        "positives": positives[:8],
        "risks": risks[:8],
        "opportunity_score": round(score, 2),
        "news_impact": round(news_impact, 2),
        "news_count": len(news),
        "summary": (
            f"التقييم الكمي المتكامل للسهم {score:.1f}/100، مع دمج التحليل الفني "
            "والسيولة والزخم وإشارات الاختراق والأخبار عند توفرها. "
            "هذا تحليل آلي لا يمثل نصيحة مالية."
        ),
        "signals": signals,
        "rsi14": rsi,
        "quote": {
            "price": quote.get("price"),
            "change_percent": quote.get("change_percent"),
        },
    }
