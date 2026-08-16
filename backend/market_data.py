from __future__ import annotations
from datetime import datetime, timezone, timedelta
from typing import Any
import httpx
from .config import settings

class MarketDataError(RuntimeError):
    pass


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
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT, headers={"User-Agent": "Mozilla/5.0"}) as client:
        r = await client.get(url, params={"period1": period1, "period2": period2, "interval": "1d", "events": "history"})
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

    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT, headers={"User-Agent": "Mozilla/5.0"}) as client:
            r = await client.get("https://query1.finance.yahoo.com/v7/finance/quote", params={"symbols": symbol})
            r.raise_for_status()
            data = r.json()
        if data.get("quoteResponse", {}).get("result"):
            return _yahoo_quote(data, symbol)
    except (httpx.HTTPError, ValueError, KeyError):
        pass

    if not settings.FINNHUB_API_KEY:
        raise MarketDataError(f"No market data available for {symbol}")

    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
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
    except MarketDataError:
        raise
    except (httpx.HTTPError, ValueError) as exc:
        raise MarketDataError(f"Market data provider error: {exc}") from exc


async def get_history(symbol: str, days: int = 260) -> list[dict[str, Any]]:
    symbol = symbol.strip().upper()
    days = max(60, min(days, 1000))
    try:
        history = await _yahoo_chart(symbol, days)
        if history:
            return history
    except (httpx.HTTPError, ValueError, KeyError, IndexError):
        pass

    if not settings.FINNHUB_API_KEY:
        return []

    now = int(datetime.now(timezone.utc).timestamp())
    start = now - days * 86400
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            r = await client.get(
                "https://finnhub.io/api/v1/stock/candle",
                params={"symbol": symbol, "resolution": "D", "from": start, "to": now, "token": settings.FINNHUB_API_KEY},
            )
            r.raise_for_status()
            data = r.json()
        if data.get("s") != "ok":
            return []
        return [
            {"timestamp": t, "open": o, "high": h, "low": l, "close": c, "volume": v or 0}
            for t, o, h, l, c, v in zip(
                data.get("t", []), data.get("o", []), data.get("h", []),
                data.get("l", []), data.get("c", []), data.get("v", []),
            )
        ][-days:]
    except (httpx.HTTPError, ValueError):
        return []
