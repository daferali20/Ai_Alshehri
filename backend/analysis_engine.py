from __future__ import annotations

from typing import Any


def _number(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def analyze_quote(quote: dict[str, Any]) -> dict[str, Any]:
    """Create a transparent baseline score from live quote data.

    This is intentionally deterministic. A future ML model can replace this
    function without changing the API contract.
    """
    change = _number(quote.get("change_percent"), 0)
    score = 50.0

    if change >= 5:
        score += 25
    elif change >= 2:
        score += 15
    elif change > 0:
        score += 5
    elif change <= -5:
        score -= 25
    elif change <= -2:
        score -= 15
    elif change < 0:
        score -= 5

    score = max(0.0, min(100.0, score))
    if score >= 75:
        signal = "strong"
    elif score >= 60:
        signal = "positive"
    elif score <= 35:
        signal = "weak"
    else:
        signal = "neutral"

    return {
        "score": round(score, 2),
        "signal": signal,
        "confidence": round(abs(score - 50) / 50, 2),
        "change_percent": change,
        "explanation": "Baseline quantitative score; not financial advice.",
    }
