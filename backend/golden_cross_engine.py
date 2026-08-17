from __future__ import annotations

from typing import Any


def _sma(values: list[float], period: int) -> float | None:
    if len(values) < period:
        return None
    return sum(values[-period:]) / period


def analyze_golden_cross(rows: list[dict[str, Any]]) -> dict[str, Any]:
    closes = []
    for row in rows:
        try:
            value = float(row.get("close"))
            if value > 0:
                closes.append(value)
        except (TypeError, ValueError):
            continue

    if len(closes) < 50:
        return {
            "score": 0.0,
            "status": "insufficient_data",
            "is_golden_cross": False,
            "cross_recent": False,
            "death_cross": False,
            "distance_percent": None,
            "spread_percent": None,
            "reasons": ["بيانات غير كافية لحساب Golden Cross"],
        }

    sma50 = _sma(closes, 50)
    sma200 = _sma(closes, 200)
    if sma50 is None:
        return {"score": 0.0, "status": "insufficient_data", "is_golden_cross": False, "cross_recent": False, "death_cross": False, "distance_percent": None, "spread_percent": None, "reasons": []}

    # With fewer than 200 observations we can still identify a developing setup,
    # but we do not call it a confirmed Golden Cross.
    if sma200 is None:
        return {
            "score": 45.0 if sma50 > 0 else 0.0,
            "status": "developing",
            "is_golden_cross": False,
            "cross_recent": False,
            "death_cross": False,
            "distance_percent": None,
            "spread_percent": None,
            "reasons": ["SMA50 متاح، لكن نحتاج 200 جلسة لتأكيد التقاطع"],
        }

    previous_50 = _sma(closes[:-1], 50)
    previous_200 = _sma(closes[:-1], 200)
    cross_recent = bool(previous_50 is not None and previous_200 is not None and previous_50 <= previous_200 and sma50 > sma200)
    death_cross = bool(previous_50 is not None and previous_200 is not None and previous_50 >= previous_200 and sma50 < sma200)
    spread_percent = ((sma50 - sma200) / sma200) * 100 if sma200 else 0.0
    distance_percent = ((closes[-1] - sma50) / sma50) * 100 if sma50 else 0.0

    score = 0.0
    reasons: list[str] = []
    if sma50 > sma200:
        score += 45
        reasons.append("SMA50 أعلى من SMA200")
    if cross_recent:
        score += 30
        reasons.append("Golden Cross حديث")
    elif sma50 > sma200 and spread_percent >= 2:
        score += 15
        reasons.append("اتجاه صاعد مؤكد فوق المتوسطات")
    if closes[-1] > sma50:
        score += 10
        reasons.append("السعر فوق SMA50")
    if 0 < spread_percent <= 8:
        score += 10
        reasons.append("مسافة صحية بين SMA50 وSMA200")
    if spread_percent > 15:
        score -= 5
        reasons.append("التباعد كبير وقد تكون الحركة ممتدة")
    if death_cross:
        score = 0
        reasons = ["Death Cross حديث"]

    score = max(0.0, min(100.0, score))
    if death_cross:
        status = "death_cross"
    elif cross_recent:
        status = "recent_golden_cross"
    elif sma50 > sma200:
        status = "confirmed_uptrend"
    else:
        status = "no_golden_cross"

    return {
        "score": round(score, 2),
        "status": status,
        "is_golden_cross": sma50 > sma200,
        "cross_recent": cross_recent,
        "death_cross": death_cross,
        "sma50": round(sma50, 4),
        "sma200": round(sma200, 4),
        "distance_percent": round(distance_percent, 2),
        "spread_percent": round(spread_percent, 2),
        "reasons": reasons,
    }
