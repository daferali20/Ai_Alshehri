from __future__ import annotations

"""Opportunity Radar engine.

Combines the existing deterministic engines into one transparent 0-100 score.
It is for opportunity discovery/monitoring only and does not execute trades.
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
) -> dict[str, Any]:
    """Calculate a transparent multi-engine opportunity score.

    Weights are intentionally stable and explainable:
    technical 25%, liquidity 20%, momentum 20%, breakout 15%,
    Golden Cross 10%, relative volume 5%, 52-week position 5%.
    """
    quote = quote or {}
    breakout = breakout or {}
    golden_cross = golden_cross or {}
    advanced_liquidity = advanced_liquidity or {}

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
    }

    weights = {
        "technical": 0.25,
        "liquidity": 0.20,
        "momentum": 0.20,
        "breakout": 0.15,
        "golden_cross": 0.10,
        "relative_volume": 0.05,
        "52_week_position": 0.05,
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
        "metrics": {
            "relative_volume": round(relative_volume, 2) if relative_volume else None,
            "distance_to_52w_high_percent": round(distance_to_high, 2) if distance_to_high is not None else None,
            "52_week_position_percent": round(position, 2) if position is not None else None,
        },
        "explanation": "Quantitative multi-engine opportunity score for discovery and monitoring; not financial advice.",
    }
