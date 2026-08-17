from __future__ import annotations

"""Opportunity Radar engine.

Combines deterministic technical, liquidity, momentum and news engines into
one transparent 0-100 discovery score. It never executes trades.
"""

from typing import Any


def _num(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def calculate_opportunity(
    technical: dict[str, Any],
    liquidity: dict[str, Any],
    momentum: dict[str, Any],
    quote: dict[str, Any] | None = None,
    breakout: dict[str, Any] | None = None,
    golden_cross: dict[str, Any] | None = None,
    advanced_liquidity: dict[str, Any] | None = None,
    news: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Calculate a transparent multi-engine opportunity score.

    News is a catalyst factor, not a standalone recommendation.
    """
    quote = quote or {}
    breakout = breakout or {}
    golden_cross = golden_cross or {}
    advanced_liquidity = advanced_liquidity or {}
    news = news or []

    indicators = technical.get("indicators", {}) or {}
    signals = technical.get("signals", {}) or {}

    technical_score = _clamp(_num(technical.get("technical_score"), 50.0))
    liquidity_score = _clamp(_num(advanced_liquidity.get("score"), _num(liquidity.get("score"), 50.0)))
    momentum_score = _clamp(_num(momentum.get("score"), 50.0))
    breakout_score = _clamp(_num(breakout.get("score"), 0.0))
    golden_score = _clamp(_num(golden_cross.get("score"), 0.0))

    relative_volume = _num(
        advanced_liquidity.get("relative_volume"),
        _num(indicators.get("relative_volume20"), 0.0),
    )
    if relative_volume >= 3:
        volume_score = 100.0
    elif relative_volume >= 2:
        volume_score = 90.0
    elif relative_volume >= 1.5:
        volume_score = 75.0
    elif relative_volume >= 1.2:
        volume_score = 60.0
    elif relative_volume >= 1.0:
        volume_score = 50.0
    elif relative_volume > 0:
        volume_score = 35.0
    else:
        volume_score = 50.0

    # Use the strongest recent five stories, with a small freshness-aware bias
    # already provided by news_engine. Neutral news is kept at its impact level,
    # while negative news is not allowed to disappear from the explanation.
    recent_news = sorted(news, key=lambda x: _num(x.get("impact_score")), reverse=True)[:5]
    if recent_news:
        news_impact_score = sum(_num(item.get("impact_score"), 0) for item in recent_news) / len(recent_news)
        sentiment_values = {"positive": 1.0, "neutral": 0.0, "negative": -1.0}
        sentiment_balance = sum(sentiment_values.get(str(item.get("sentiment", "neutral")), 0.0) for item in recent_news) / len(recent_news)
        # Positive catalysts lift the score; negative catalysts reduce it.
        news_score = _clamp(news_impact_score + sentiment_balance * 15.0)
    else:
        news_score = 50.0
        sentiment_balance = 0.0

    price = _num(quote.get("price"), _num(technical.get("price"), 0.0))
    high52 = _num(indicators.get("high52"), 0.0)
    low52 = _num(indicators.get("low52"), 0.0)
    if high52 > low52 > 0 and price > 0:
        position = _clamp((price - low52) / (high52 - low52) * 100)
        position_score = _clamp(50 + (position - 50) * 0.8)
        distance_to_high = ((high52 - price) / high52) * 100
    else:
        position = None
        position_score = 50.0
        distance_to_high = None

    components = {
        "technical": round(technical_score, 2),
        "liquidity": round(liquidity_score, 2),
        "momentum": round(momentum_score, 2),
        "breakout": round(breakout_score, 2),
        "golden_cross": round(golden_score, 2),
        "relative_volume": round(volume_score, 2),
        "52_week_position": round(position_score, 2),
        "news_impact": round(news_score, 2),
    }

    weights = {
        "technical": 0.225,
        "liquidity": 0.18,
        "momentum": 0.18,
        "breakout": 0.135,
        "golden_cross": 0.09,
        "relative_volume": 0.045,
        "52_week_position": 0.045,
        "news_impact": 0.10,
    }
    score = round(_clamp(sum(components[k] * weights[k] for k in weights)), 2)

    if score >= 85:
        label, display_label = "exceptional_opportunity", "فرصة استثنائية"
    elif score >= 80:
        label, display_label = "strong_opportunity", "فرصة قوية"
    elif score >= 70:
        label, display_label = "good_opportunity", "فرصة جيدة"
    elif score >= 60:
        label, display_label = "watch", "مراقبة"
    elif score >= 45:
        label, display_label = "neutral", "محايد"
    else:
        label, display_label = "weak", "ضعيف"

    reasons: list[str] = []
    if technical_score >= 65:
        reasons.append("قوة فنية جيدة")
    if liquidity_score >= 70:
        reasons.append("سيولة مرتفعة")
    if momentum_score >= 60:
        reasons.append("زخم إيجابي")
    if breakout_score >= 70:
        reasons.append("اختراق قوي أو قريب من اختراق")
    if golden_score >= 70:
        reasons.append("Golden Cross أو اتجاه متوسطات قوي")
    if relative_volume >= 1.5:
        reasons.append("حجم تداول أعلى من المتوسط")
    if news_score >= 70 and sentiment_balance > 0:
        reasons.append("محفز إخباري إيجابي")
    elif news_score >= 70 and sentiment_balance < 0:
        reasons.append("أخبار عالية التأثير لكنها سلبية")
    elif news_score >= 70:
        reasons.append("أخبار حديثة عالية التأثير")
    if position is not None and position >= 80:
        reasons.append("السعر في الجزء القوي من نطاق 52 أسبوعًا")

    warnings: list[str] = []
    rsi = _num(indicators.get("rsi14"), 0.0)
    if rsi > 75:
        warnings.append("RSI مرتفع وقد يعني امتدادًا قصير الأجل")
    if 0 < relative_volume < 0.8:
        warnings.append("الحجم الحالي أقل من المتوسط")
    if momentum_score < 40:
        warnings.append("الزخم ضعيف")
    if breakout_score < 30:
        warnings.append("لا يوجد اختراق واضح")
    if news_score >= 70 and sentiment_balance < 0:
        warnings.append("يوجد محفز إخباري سلبي مرتفع التأثير")

    return {
        "score": score,
        "label": label,
        "display_label": display_label,
        "components": components,
        "weights": weights,
        "reasons": reasons,
        "warnings": warnings,
        "signals": {
            "breakout": bool(breakout.get("breakout", signals.get("breakout_60d", False))),
            "golden_cross": bool(golden_cross.get("golden_cross", signals.get("golden_cross", False))),
        },
        "news": {
            "count_analyzed": len(recent_news),
            "impact_score": round(news_score, 2),
            "sentiment_balance": round(sentiment_balance, 2),
            "positive": sum(1 for item in recent_news if item.get("sentiment") == "positive"),
            "neutral": sum(1 for item in recent_news if item.get("sentiment") == "neutral"),
            "negative": sum(1 for item in recent_news if item.get("sentiment") == "negative"),
        },
        "metrics": {
            "relative_volume": round(relative_volume, 2) if relative_volume else None,
            "distance_to_52w_high_percent": round(distance_to_high, 2) if distance_to_high is not None else None,
            "52_week_position_percent": round(position, 2) if position is not None else None,
        },
        "explanation": "Quantitative multi-engine opportunity score with news catalyst factor; discovery/monitoring only, not financial advice.",
    }
