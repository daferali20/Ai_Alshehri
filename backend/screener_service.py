from __future__ import annotations

import asyncio
from typing import Any

from .ai_ranking import rank_stock
from .breakout_engine import analyze_breakout
from .advanced_liquidity_engine import analyze_advanced_liquidity
from .liquidity_engine import analyze_liquidity, analyze_momentum
from .market_data import MarketDataError, get_history, get_quote
from .market_universe import get_us_universe
from .opportunity_engine import calculate_opportunity
from .technical_analysis import analyze_ohlcv


async def screen_us_stocks(
    symbols: list[str] | None = None,
    min_score: float = 0,
    min_change_percent: float | None = None,
    max_price: float | None = None,
    limit: int = 20,
    mode: str = "most-active",
) -> list[dict[str, Any]]:
    universe = list(dict.fromkeys(s.upper().strip() for s in (symbols or get_us_universe()) if s.strip()))

    signal_modes = {"breakouts", "golden-cross", "volume-surge", "momentum", "liquidity", "opportunities"}
    scan_size = min(len(universe), max(limit * 4, 40) if mode in signal_modes else max(limit * 2, 20))
    universe = universe[:scan_size]
    semaphore = asyncio.Semaphore(8)

    async def scan(symbol: str) -> dict[str, Any] | None:
        async with semaphore:
            try:
                quote, history = await asyncio.gather(get_quote(symbol), get_history(symbol, 260))
            except (MarketDataError, ValueError, TypeError):
                return None

            price = quote.get("price")
            change = quote.get("change_percent")
            if not isinstance(price, (int, float)) or price <= 0:
                return None
            if max_price is not None and price > max_price:
                return None
            if min_change_percent is not None and (not isinstance(change, (int, float)) or change < min_change_percent):
                return None

            if history:
                latest_volume = history[-1].get("volume")
                if isinstance(latest_volume, (int, float)) and latest_volume >= 0:
                    quote = {**quote, "volume": latest_volume}

            rows = history or [{"close": price, "volume": quote.get("volume", 0) or 0}]
            try:
                technical = analyze_ohlcv(rows)
                liquidity = analyze_liquidity(rows)
                advanced_liquidity = analyze_advanced_liquidity(rows)
                momentum = analyze_momentum(rows)
                ranking = rank_stock(technical, liquidity, momentum, quote)
                opportunity = calculate_opportunity(technical, liquidity, momentum, quote)
                breakout = analyze_breakout(rows)
            except (ValueError, TypeError, KeyError, IndexError):
                return None

            indicators = technical.get("indicators", {})
            signals = technical.get("signals", {})
            relative_volume = indicators.get("relative_volume20") or advanced_liquidity.get("relative_volume") or 0

            if mode == "opportunities" and opportunity["score"] < min_score:
                return None
            if mode not in signal_modes and ranking["score"] < min_score:
                return None
            if mode == "breakouts" and breakout.get("score", 0) <= 0:
                return None
            if mode == "golden-cross" and not signals.get("golden_cross"):
                return None
            if mode == "volume-surge" and relative_volume < 1.5:
                return None
            if mode == "momentum" and momentum.get("score", 0) < 60:
                return None
            if mode == "liquidity" and advanced_liquidity.get("score", 0) < 60:
                return None

            return {
                "symbol": symbol,
                "quote": quote,
                "history_points": len(history),
                "technical": technical,
                "liquidity": liquidity,
                "advanced_liquidity": advanced_liquidity,
                "momentum": momentum,
                "ranking": ranking,
                "opportunity": opportunity,
                "breakout": breakout,
            }

    scanned = await asyncio.gather(*(scan(symbol) for symbol in universe), return_exceptions=False)
    results = [item for item in scanned if item is not None]

    if mode == "top-gainers":
        results.sort(key=lambda x: x.get("quote", {}).get("change_percent", -10**9), reverse=True)
    elif mode == "most-active":
        results.sort(key=lambda x: x.get("quote", {}).get("volume", 0) or 0, reverse=True)
    elif mode == "breakouts":
        results.sort(key=lambda x: x.get("breakout", {}).get("score", -1), reverse=True)
    elif mode == "liquidity":
        results.sort(key=lambda x: x.get("advanced_liquidity", {}).get("score", -1), reverse=True)
    else:
        results.sort(key=lambda x: x.get("opportunity", {}).get("score", -1), reverse=True)

    return results[: max(1, min(limit, 100))]
