from __future__ import annotations

import asyncio
from typing import Any

from .ai_ranking import rank_stock
from .liquidity_engine import analyze_liquidity, analyze_momentum
from .market_data import MarketDataError, get_quote
from .market_universe import get_us_universe
from .technical_analysis import analyze_ohlcv


async def screen_us_stocks(
    symbols: list[str] | None = None,
    min_score: float = 0,
    min_change_percent: float | None = None,
    max_price: float | None = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    universe = symbols or get_us_universe()
    universe = list(dict.fromkeys(s.upper().strip() for s in universe if s.strip()))

    semaphore = asyncio.Semaphore(8)

    async def scan(symbol: str) -> dict[str, Any] | None:
        async with semaphore:
            try:
                quote = await get_quote(symbol)
            except MarketDataError as exc:
                return {"symbol": symbol, "error": str(exc)}

            price = quote.get("price")
            change = quote.get("change_percent")
            if max_price is not None and isinstance(price, (int, float)) and price > max_price:
                return None
            if min_change_percent is not None and isinstance(change, (int, float)) and change < min_change_percent:
                return None

            # Quote-only fallback keeps the service usable when the historical
            # candle provider is not configured yet. Full OHLCV is consumed by
            # the same analysis functions when added by a provider.
            rows = [{"close": price, "volume": 0}] if isinstance(price, (int, float)) else []
            technical = analyze_ohlcv(rows) if rows else {"technical_score": 0}
            liquidity = analyze_liquidity(rows) if rows else {"score": 0}
            momentum = analyze_momentum(rows) if rows else {"score": 0}
            ranking = rank_stock(technical, liquidity, momentum, quote)
            if ranking["score"] < min_score:
                return None
            return {"symbol": symbol, "quote": quote, "technical": technical, "liquidity": liquidity, "momentum": momentum, "ranking": ranking}

    scanned = await asyncio.gather(*(scan(symbol) for symbol in universe))
    results = [item for item in scanned if item is not None]
    results.sort(key=lambda item: item.get("ranking", {}).get("score", -1), reverse=True)
    return results[: max(1, min(limit, 100))]
