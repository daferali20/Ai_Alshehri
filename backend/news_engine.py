from __future__ import annotations
from typing import Any
import os
import requests


def _sentiment(text: str) -> str:
    positive = {"beat", "growth", "upgrade", "surge", "profit", "strong", "record", "bullish"}
    negative = {"miss", "downgrade", "fall", "drop", "loss", "weak", "bearish", "lawsuit"}
    words = {w.strip(".,:;!?()[]").lower() for w in text.split()}
    score = len(words & positive) - len(words & negative)
    return "positive" if score > 0 else "negative" if score < 0 else "neutral"


def get_news(symbol: str, limit: int = 10) -> list[dict[str, Any]]:
    api_key = os.getenv("FINNHUB_API_KEY")
    if not api_key:
        return []
    response = requests.get("https://finnhub.io/api/v1/company-news", params={"symbol": symbol.upper(), "from": "2026-01-01", "to": "2026-12-31", "token": api_key}, timeout=10)
    response.raise_for_status()
    result = []
    for item in (response.json() or [])[:limit]:
        headline = item.get("headline", "")
        summary = item.get("summary", "")
        result.append({"headline": headline, "source": item.get("source"), "url": item.get("url"), "published_at": item.get("datetime"), "summary": summary, "sentiment": _sentiment(f"{headline} {summary}")})
    return result
