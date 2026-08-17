from __future__ import annotations

"""Advanced breakout detection for opportunity discovery.

Deterministic scanner only: no trading execution and no financial advice.
"""

from typing import Any


def _num(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _highest(values: list[float], lookback: int) -> float | None:
    if len(values) <= lookback:
        return None
    return max(values[-lookback - 1 : -1])


def analyze_breakout(rows: list[dict[str, Any]]) -> dict[str, Any]:
    closes = [_num(r.get("close")) for r in rows]
    highs = [_num(r.get("high")) for r in rows]
    volumes = [_num(r.get("volume")) for r in rows]
    closes = [x for x in closes if x is not None]
    highs = [x for x in highs if x is not None]
    volumes = [x for x in volumes if x is not None]

    if not closes:
        raise ValueError("No valid close prices supplied")

    price = closes[-1]
    levels: dict[str, float | None] = {
        "20d": _highest(closes, 20),
        "60d": _highest(closes, 60),
        "252d": max(closes[:-1]) if len(closes) > 252 else None,
    }

    hit_20 = levels["20d"] is not None and price > levels["20d"]
    hit_60 = levels["60d"] is not None and price > levels["60d"]
    hit_52w = levels["252d"] is not None and price > levels["252d"]

    avg_volume20 = sum(volumes[-20:]) / min(20, len(volumes)) if volumes else 0.0
    relative_volume = volumes[-1] / avg_volume20 if volumes and avg_volume20 > 0 else None

    volume_confirmed = relative_volume is not None and relative_volume >= 1.5
    rvol_strong = relative_volume is not None and relative_volume >= 2.0

    breakout_count = sum((hit_20, hit_60, hit_52w))
    score = 0.0
    reasons: list[str] = []
    warnings: list[str] = []

    if hit_20:
        score += 20
        reasons.append("اختراق قمة 20 جلسة")
    if hit_60:
        score += 30
        reasons.append("اختراق قمة 60 جلسة")
    if hit_52w:
        score += 30
        reasons.append("اختراق قمة 52 أسبوعًا")
    if volume_confirmed:
        score += 15
        reasons.append("الاختراق مدعوم بحجم تداول مرتفع")
    elif relative_volume is not None and relative_volume < 0.8:
        warnings.append("الاختراق غير مدعوم بحجم تداول كافٍ")
    if rvol_strong:
        reasons.append("الحجم أعلى بوضوح من المتوسط")

    # A close back below the relevant breakout level is a warning rather than
    # a confirmed breakout. This is evaluated on the latest close only.
    false_breakout_risk = False
    relevant_level = levels["60d"] or levels["20d"]
    if relevant_level is not None and price <= relevant_level:
        false_breakout_risk = False

    if breakout_count == 0:
        score = 0.0
        label = "no_breakout"
        display_label = "لا يوجد اختراق"
    elif hit_52w and volume_confirmed:
        label = "confirmed_52w_breakout"
        display_label = "اختراق 52 أسبوع مؤكد"
    elif hit_60 and volume_confirmed:
        label = "confirmed_breakout"
        display_label = "اختراق مؤكد"
    elif hit_20:
        label = "early_breakout"
        display_label = "اختراق مبكر"
    else:
        label = "breakout_watch"
        display_label = "مراقبة اختراق"

    return {
        "score": round(min(100.0, score), 2),
        "label": label,
        "display_label": display_label,
        "breakouts": {
            "20d": hit_20,
            "60d": hit_60,
            "52w": hit_52w,
        },
        "levels": levels,
        "relative_volume": round(relative_volume, 2) if relative_volume is not None else None,
        "volume_confirmed": volume_confirmed,
        "false_breakout_risk": false_breakout_risk,
        "reasons": reasons,
        "warnings": warnings,
    }
