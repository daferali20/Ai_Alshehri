from __future__ import annotations

import asyncio
from typing import Any

from .liquidity_engine import analyze_liquidity, analyze_momentum
from .market_data import MarketDataError, get_quote
from .technical_analysis import analyze_ohlcv


async def screen_symbols(symbols: list[str], min_score: float = 0, max_price: float | None = None) -> list[dict[str, Any]]:
    symbols = list(dict.fromkeys(s.strip().upper() for s in symbols if s.strip()))

    async def scan(symbol: str) -> dict[str, Any]:
        try:
            quote = await get_quote(symbol)
            rows = [{"close": quote["price"], "volume": 0}] if quote.get("price") is not None else []
            technical = analyze_ohlcv(rows) if rows else {}
            liquidity = analyze_liquidity(rows) if rows else {"score": 0}
            momentum = analyze_momentum(rows) if rows else {"score": 0}
            scores = [x for x in (technical.get("technical_score"), liquidity.get("score"), momentum.get("score")) if isinstance(x, (int, float))]
            final = sum(scores) / len(scores) if scores else 0
            if max_price is not None and isinstance(quote.get("price"), (int, float)) and quote["price"] > max_price:
                return {"symbol": symbol, "filtered": True, "reason": "price"}
            if final < min_score:
                return {"symbol": symbol, "filtered": True, "reason": "score"}
            return {"symbol": symbol, "quote": quote, "technical": technical, "liquidity": liquidity, "momentum": momentum, "final_score": round(final, 2)}
        except (MarketDataError, ValueError) as exc:
            return {"symbol": symbol, "error": str(exc)}

    results = await asyncio.gather(*(scan(symbol) for symbol in symbols))
    return sorted((r for r in results if not r.get("filtered")), key=lambda x: x.get("final_score", -1), reverse=True)
