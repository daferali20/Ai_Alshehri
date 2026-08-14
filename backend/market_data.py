from __future__ import annotations

from datetime import datetime
from typing import Any

import httpx

try:
    from .config import settings
except ImportError:
    from config import settings


class MarketDataError(RuntimeError):
    pass


async def get_quote(symbol: str) -> dict[str, Any]:
    symbol = symbol.strip().upper()
    if not symbol:
        raise ValueError("Symbol is required")

    if settings.FINNHUB_API_KEY:
        url = "https://finnhub.io/api/v1/quote"
        params = {"symbol": symbol, "token": settings.FINNHUB_API_KEY}
        try:
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
            if not data or data.get("c") is None:
                raise MarketDataError(f"No quote data for {symbol}")
            return {
                "symbol": symbol,
                "price": float(data.get("c", 0)),
                "change": float(data.get("d", 0)),
                "change_percent": float(data.get("dp", 0)),
                "high": float(data.get("h", 0)),
                "low": float(data.get("l", 0)),
                "open": float(data.get("o", 0)),
                "previous_close": float(data.get("pc", 0)),
                "timestamp": datetime.utcnow().isoformat(),
                "source": "finnhub",
            }
        except (httpx.HTTPError, ValueError) as exc:
            raise MarketDataError(f"Market data provider error: {exc}") from exc

    return {
        "symbol": symbol,
        "price": None,
        "change": None,
        "change_percent": None,
        "high": None,
        "low": None,
        "open": None,
        "previous_close": None,
        "timestamp": datetime.utcnow().isoformat(),
        "source": "unconfigured",
        "message": "Set FINNHUB_API_KEY to enable live quotes.",
    }
