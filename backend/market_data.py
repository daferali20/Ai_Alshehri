from __future__ import annotations

import time
from datetime import datetime, timezone, timedelta
from typing import Any

import httpx

from .config import settings


class MarketDataError(RuntimeError):
    pass


# Reuse connections instead of creating a new HTTP client for every symbol.
_http_client: httpx.AsyncClient | None = None
_quote_cache: dict[str, tuple[float, dict[str, Any]]] = {}
_history_cache: dict[tuple[str, int], tuple[float, list[dict[str, Any]]]] = {}

QUOTE_TTL = 10.0
HISTORY_TTL = 120.0


async def _client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=min(settings.REQUEST_TIMEOUT, 12.0),
            headers={"User-Agent": "Mozilla/5.0 Ai-Alshehri"},
            limits=httpx.Limits(max_connections=40, max_keepalive_connections=20),
        )
    return _http_client


async def _finnhub_quote(symbol: str) -> dict[str, Any]:
    if not settings.FINNHUB_API_KEY:
        raise MarketDataError("Finnhub API key is not configured")

    client = await _client()
    r = await client.get(
        "https://finnhub.io/api/v1/quote",
        params={"symbol": symbol, "token": settings.FINNHUB_API_KEY},
    )
    r.raise_for_status()
    data = r.json()
    if data.get("c") is None or float(data.get("c", 0)) <= 0:
        raise MarketDataError(f"No quote data for {symbol}")

    return {
        "symbol": symbol,
        "price": float(data.get("c", 0)),
        "change": float(data.get("d", 0) or 0),
        "change_percent": float(data.get("dp", 0) or 0),
        "high": float(data.get("h", 0) or 0),
        "low": float(data.get("l", 0) or 0),
        "open": float(data.get("o", 0) or 0),
        "previous_close": float(data.get("pc", 0) or 0),
        "volume": 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "finnhub",
    }


def _yahoo_quote(data: dict[str, Any], symbol: str) -> dict[str, Any]:
    result = (data.get("quoteResponse", {}).get("result") or [{}])[0]
    return {
        "symbol": symbol,
        "price": result.get("regularMarketPrice"),
        "change": result.get("regularMarketChange"),
        "change_percent": result.get("regularMarketChangePercent"),
        "high": result.get("regularMarketDayHigh"),
        "low": result.get("regularMarketDayLow"),
        "open": result.get("regularMarketOpen"),
        "previous_close": result.get("regularMarketPreviousClose"),
        "volume": result.get("regularMarketVolume") or result.get("averageDailyVolume3Month") or 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "yahoo_finance",
    }


async def _yahoo_chart(symbol: str, days: int) -> list[dict[str, Any]]:
    period2 = int(datetime.now(timezone.utc).timestamp())
    period1 = int((datetime.now(timezone.utc) - timedelta(days=days)).timestamp())
    client = await _client()
    r = await client.get(
        f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
        params={"period1": period1, "period2": period2, "interval": "1d", "events": "history"},
    )
    r.raise_for_status()
    data = r.json()
    result = (data.get("chart", {}).get("result") or [{}])[0]
    timestamps = result.get("timestamp") or []
    quote = (result.get("indicators", {}).get("quote") or [{}])[0]
    return [
        {"timestamp": t, "open": o, "high": h, "low": l, "close": c, "volume": v or 0}
        for t, o, h, l, c, v in zip(
            timestamps,
            quote.get("open", []),
            quote.get("high", []),
            quote.get("low", []),
            quote.get("close", []),
            quote.get("volume", []),
        )
        if c is not None
    ][-days:]


async def get_quote(symbol: str) -> dict[str, Any]:
    symbol = symbol.strip().upper()
    if not symbol:
        raise ValueError("Symbol is required")

    now = time.monotonic()
    cached = _quote_cache.get(symbol)
    if cached and now - cached[0] < QUOTE_TTL:
        return dict(cached[1])

    if settings.FINNHUB_API_KEY:
        try:
            result = await _finnhub_quote(symbol)
            _quote_cache[symbol] = (now, result)
            return result
        except (httpx.HTTPError, ValueError, KeyError, MarketDataError):
            pass

    try:
        client = await _client()
        r = await client.get(
            "https://query1.finance.yahoo.com/v7/finance/quote",
            params={"symbols": symbol},
        )
        r.raise_for_status()
        data = r.json()
        if data.get("quoteResponse", {}).get("result"):
            result = _yahoo_quote(data, symbol)
            _quote_cache[symbol] = (now, result)
            return result
    except (httpx.HTTPError, ValueError, KeyError):
        pass

    raise MarketDataError(f"No market data available for {symbol}")


async def get_history(symbol: str, days: int = 260) -> list[dict[str, Any]]:
    symbol = symbol.strip().upper()
    days = max(60, min(days, 1000))
    cache_key = (symbol, days)
    now_monotonic = time.monotonic()

    cached = _history_cache.get(cache_key)
    if cached and now_monotonic - cached[0] < HISTORY_TTL:
        return cached[1]

    try:
        history = await _yahoo_chart(symbol, days)
        if history:
            _history_cache[cache_key] = (now_monotonic, history)
            return history
    except (httpx.HTTPError, ValueError, KeyError, IndexError):
        pass

    if not settings.FINNHUB_API_KEY:
        return []

    now = int(datetime.now(timezone.utc).timestamp())
    start = now - days * 86400
    try:
        client = await _client()
        r = await client.get(
            "https://finnhub.io/api/v1/stock/candle",
            params={
                "symbol": symbol,
                "resolution": "D",
                "from": start,
                "to": now,
                "token": settings.FINNHUB_API_KEY,
            },
        )
        r.raise_for_status()
        data = r.json()
        if data.get("s") != "ok":
            return []
        history = [
            {"timestamp": t, "open": o, "high": h, "low": l, "close": c, "volume": v or 0}
            for t, o, h, l, c, v in zip(
                data.get("t", []),
                data.get("o", []),
                data.get("h", []),
                data.get("l", []),
                data.get("c", []),
                data.get("v", []),
            )
        ][-days:]
        _history_cache[cache_key] = (now_monotonic, history)
        return history
    except (httpx.HTTPError, ValueError):
        return []
