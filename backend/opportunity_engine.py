from __future__ import annotations

"""Opportunity Engine

Combines the existing technical, liquidity and momentum engines into one
transparent 0-100 opportunity score. This module is intentionally deterministic
and does not execute trades or provide financial advice.
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
) -> dict[str, Any]:
    """Calculate a transparent opportunity score from existing analysis data.

    Weights:
        Technical 35%
        Liquidity 25%
        Momentum 20%
        Breakout 10%
        Relative Volume 5%
        52-week positioning 5%
    """
    quote = quote or {}
    indicators = technical.get("indicators", {}) or {}
    signals = technical.get("signals", {}) or {}

    technical_score = _num(technical.get("technical_score"), 50.0)
    liquidity_score = _num(liquidity.get("score"), 50.0)
    momentum_score = _num(momentum.get("score"), 50.0)
    relative_volume = _num(indicators.get("relative_volume20"), 0.0)

    # Breakout component: a confirmed breakout gets the full component.
    # A stock close to the 60-day high receives partial credit.
    breakout = bool(signals.get("breakout_60d"))
    price = _num(quote.get("price"), _num(technical.get("price"), 0.0))

    high52 = _num(indicators.get("high52"), 0.0)
    low52 = _num(indicators.get("low52"), 0.0)
    if high52 > 0 and price > 0:
        distance_to_high = ((high52 - price) / high52) * 100
        if breakout:
            breakout_score = 100.0
        elif distance_to_high <= 2:
            breakout_score = 85.0
        elif distance_to_high <= 5:
            breakout_score = 65.0
        elif distance_to_high <= 10:
            breakout_score = 40.0
        else:
            breakout_score = 20.0
    else:
        distance_to_high = None
        breakout_score = 50.0

    # Relative-volume score. 1x is normal; 2x+ is exceptional.
    if relative_volume >= 3:
        volume_score = 100.0
    elif relative_volume >= 2:
        volume_score = 90.0
    elif relative_volume >= 1.5:
        volume_score = 75.0
    elif relative_volume >= 1.2:
        volume_score = 60.0
    elif relative_volume > 0:
        volume_score = 35.0
    else:
        volume_score = 50.0

    # 52-week positioning rewards strength without treating a new high as a
    # standalone buy signal.
    if high52 > low52 > 0 and price > 0:
        position = _clamp((price - low52) / (high52 - low52) * 100)
        position_score = _clamp(50 + (position - 50) * 0.8)
    else:
        position = None
        position_score = 50.0

    components = {
        "technical": round(_clamp(technical_score), 2),
        "liquidity": round(_clamp(liquidity_score), 2),
        "momentum": round(_clamp(momentum_score), 2),
        "breakout": round(breakout_score, 2),
        "relative_volume": round(volume_score, 2),
        "52_week_position": round(position_score, 2),
    }

    weights = {
        "technical": 0.35,
        "liquidity": 0.25,
        "momentum": 0.20,
        "breakout": 0.10,
        "relative_volume": 0.05,
        "52_week_position": 0.05,
    }

    score = sum(components[name] * weight for name, weight in weights.items())
    score = round(_clamp(score), 2)

    if score >= 85:
        label = "strong_opportunity"
        display_label = "فرصة قوية"
    elif score >= 75:
        label = "good_opportunity"
        display_label = "فرصة جيدة"
    elif score >= 60:
        label = "watch"
        display_label = "مراقبة"
    elif score >= 45:
        label = "neutral"
        display_label = "محايد"
    else:
        label = "weak"
        display_label = "ضعيف"

    reasons: list[str] = []
    if technical_score >= 65:
        reasons.append("قوة فنية جيدة")
    if liquidity_score >= 70:
        reasons.append("سيولة مرتفعة")
    if momentum_score >= 60:
        reasons.append("زخم إيجابي")
    if breakout:
        reasons.append("اختراق مؤكد")
    elif distance_to_high is not None and distance_to_high <= 5:
        reasons.append("قريب من قمة 52 أسبوعًا")
    if relative_volume >= 1.5:
        reasons.append("حجم تداول أعلى من المتوسط")
    if signals.get("golden_cross"):
        reasons.append("Golden Cross")

    warnings: list[str] = []
    rsi = indicators.get("rsi14")
    if rsi is not None and _num(rsi) > 75:
        warnings.append("RSI مرتفع وقد يعني امتدادًا قصير الأجل")
    if relative_volume > 0 and relative_volume < 0.8:
        warnings.append("الحجم الحالي أقل من المتوسط")
    if momentum_score < 40:
        warnings.append("الزخم ضعيف")

    return {
        "score": score,
        "label": label,
        "display_label": display_label,
        "components": components,
        "weights": weights,
        "reasons": reasons,
        "warnings": warnings,
        "signals": {
            "breakout": breakout,
            "golden_cross": bool(signals.get("golden_cross")),
        },
        "metrics": {
            "relative_volume": round(relative_volume, 2) if relative_volume else None,
            "distance_to_52w_high_percent": round(distance_to_high, 2) if distance_to_high is not None else None,
            "52_week_position_percent": round(position, 2) if position is not None else None,
        },
        "explanation": "Quantitative opportunity score for discovery and monitoring; not financial advice.",
    }
