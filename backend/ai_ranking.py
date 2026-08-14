from __future__ import annotations

from typing import Any


def rank_stock(technical: dict[str, Any], liquidity: dict[str, Any], momentum: dict[str, Any], quote: dict[str, Any] | None = None) -> dict[str, Any]:
    t = float(technical.get("technical_score", 0) or 0)
    l = float(liquidity.get("score", 0) or 0)
    m = float(momentum.get("score", 0) or 0)
    final = t * 0.45 + l * 0.30 + m * 0.25
    label = "strong_watch" if final >= 80 else "watch" if final >= 65 else "neutral" if final >= 45 else "weak"
    return {"score": round(final, 2), "label": label, "weights": {"technical": 0.45, "liquidity": 0.30, "momentum": 0.25}, "explanation": "Quantitative ranking model; not financial advice."}
