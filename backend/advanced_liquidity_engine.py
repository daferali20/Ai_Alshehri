from __future__ import annotations

from typing import Any


def _num(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def analyze_advanced_liquidity(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Score liquidity quality and acceleration from OHLCV history."""
    closes: list[float] = []
    volumes: list[float] = []
    for row in rows:
        close = _num(row.get("close"))
        volume = _num(row.get("volume"))
        if close is not None and close > 0 and volume is not None and volume >= 0:
            closes.append(close)
            volumes.append(volume)

    if len(closes) < 5:
        return {
            "score": 50.0,
            "average_dollar_volume20": None,
            "relative_volume": None,
            "volume_acceleration": None,
            "liquidity_surge": False,
            "signal": "insufficient_data",
            "reasons": [],
            "warnings": ["بيانات السيولة غير كافية"],
        }

    dollar = [c * v for c, v in zip(closes, volumes)]
    n20 = min(20, len(dollar))
    avg_dollar20 = sum(dollar[-n20:]) / n20
    avg_volume20 = sum(volumes[-n20:]) / n20
    relative_volume = volumes[-1] / avg_volume20 if avg_volume20 > 0 else None

    if len(volumes) >= 10:
        recent_n = min(5, len(volumes))
        previous = volumes[-10:-5]
        recent = volumes[-recent_n:]
        prev_avg = sum(previous) / len(previous) if previous else 0.0
        recent_avg = sum(recent) / len(recent) if recent else 0.0
        acceleration = recent_avg / prev_avg if prev_avg > 0 else None
    else:
        acceleration = None

    score = 50.0
    reasons: list[str] = []
    warnings: list[str] = []

    if avg_dollar20 >= 1_000_000_000:
        score += 30
        reasons.append("سيولة نقدية استثنائية")
    elif avg_dollar20 >= 250_000_000:
        score += 25
        reasons.append("سيولة نقدية مرتفعة جدًا")
    elif avg_dollar20 >= 50_000_000:
        score += 18
        reasons.append("سيولة نقدية مرتفعة")
    elif avg_dollar20 >= 10_000_000:
        score += 8
        reasons.append("سيولة نقدية جيدة")
    else:
        score -= 12
        warnings.append("متوسط قيمة التداول منخفض")

    if relative_volume is not None:
        if relative_volume >= 2.0:
            score += 12
            reasons.append("ارتفاع قوي في الحجم النسبي")
        elif relative_volume >= 1.5:
            score += 8
            reasons.append("الحجم النسبي أعلى من المعتاد")
        elif relative_volume < 0.7:
            score -= 5
            warnings.append("الحجم الحالي أقل من المتوسط")

    surge = False
    if acceleration is not None:
        if acceleration >= 2.0:
            score += 10
            surge = True
            reasons.append("تسارع واضح في حجم التداول")
        elif acceleration >= 1.35:
            score += 5
            reasons.append("تسارع إيجابي في حجم التداول")
        elif acceleration < 0.75:
            score -= 4
            warnings.append("تراجع تسارع الحجم")

    score = round(max(0.0, min(100.0, score)), 2)
    signal = (
        "liquidity_surge" if score >= 80 and surge else
        "very_high" if score >= 80 else
        "high" if score >= 65 else
        "medium" if score >= 45 else
        "low"
    )

    return {
        "score": score,
        "average_dollar_volume20": round(avg_dollar20, 2),
        "relative_volume": round(relative_volume, 3) if relative_volume is not None else None,
        "volume_acceleration": round(acceleration, 3) if acceleration is not None else None,
        "liquidity_surge": surge,
        "signal": signal,
        "reasons": reasons,
        "warnings": warnings,
    }
