from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
import os
import re

import requests


POSITIVE_WORDS = {
    "beat", "beats", "growth", "upgrade", "upgraded", "surge", "surges",
    "profit", "profits", "strong", "record", "bullish", "guidance",
    "outperform", "approval", "approved", "contract", "partnership",
    "revenue", "earnings", "buyback", "launch", "expands", "expansion",
}

NEGATIVE_WORDS = {
    "miss", "misses", "downgrade", "downgraded", "fall", "falls", "drop",
    "drops", "loss", "losses", "weak", "bearish", "lawsuit", "investigation",
    "warning", "cut", "cuts", "layoff", "layoffs", "recall", "delay",
    "decline", "declines", "risk", "fraud", "probe",
}

HIGH_IMPACT_WORDS = {
    "earnings", "revenue", "guidance", "merger", "acquisition", "acquire",
    "approval", "approved", "fda", "contract", "lawsuit", "investigation",
    "partnership", "buyback", "dividend", "ceo", "cfo", "forecast",
}


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z]+", text.lower()))


def _sentiment(text: str) -> str:
    words = _tokens(text)
    positive = len(words & POSITIVE_WORDS)
    negative = len(words & NEGATIVE_WORDS)

    if positive > negative:
        return "positive"
    if negative > positive:
        return "negative"
    return "neutral"


def _impact(text: str, published_at: int | None) -> tuple[int, str]:
    words = _tokens(text)
    sentiment = _sentiment(text)

    score = 35
    score += min(30, len(words & HIGH_IMPACT_WORDS) * 10)

    if sentiment != "neutral":
        score += 10

    if published_at:
        try:
            published = datetime.fromtimestamp(published_at, tz=timezone.utc)
            age_hours = max(0.0, (datetime.now(timezone.utc) - published).total_seconds() / 3600)
            if age_hours <= 6:
                score += 20
            elif age_hours <= 24:
                score += 12
            elif age_hours <= 72:
                score += 5
        except (TypeError, ValueError, OSError):
            pass

    score = max(0, min(100, score))

    if score >= 80:
        label = "high"
    elif score >= 60:
        label = "medium"
    else:
        label = "low"

    return score, label


def get_news(symbol: str, limit: int = 10, days: int = 7) -> list[dict[str, Any]]:
    """Return recent Finnhub company news with sentiment and impact scoring."""
    api_key = os.getenv("FINNHUB_API_KEY")
    if not api_key:
        return []

    symbol = symbol.strip().upper()
    if not symbol:
        return []

    now = datetime.now(timezone.utc)
    start = now - timedelta(days=max(1, days))

    try:
        response = requests.get(
            "https://finnhub.io/api/v1/company-news",
            params={
                "symbol": symbol,
                "from": start.date().isoformat(),
                "to": now.date().isoformat(),
                "token": api_key,
            },
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError):
        return []

    result: list[dict[str, Any]] = []

    for item in (payload or [])[: max(1, limit)]:
        headline = str(item.get("headline") or "").strip()
        summary = str(item.get("summary") or "").strip()
        timestamp = item.get("datetime")
        score, impact_label = _impact(f"{headline} {summary}", timestamp)

        result.append(
            {
                "headline": headline,
                "source": item.get("source"),
                "url": item.get("url"),
                "published_at": timestamp,
                "summary": summary,
                "sentiment": _sentiment(f"{headline} {summary}"),
                "impact_score": score,
                "impact": impact_label,
            }
        )

    result.sort(key=lambda item: (item.get("impact_score", 0), item.get("published_at") or 0), reverse=True)
    return result[: max(1, limit)]
