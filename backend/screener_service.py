from __future__ import annotations

import asyncio
from typing import Any

from .ai_ranking import rank_stock
from .liquidity_engine import analyze_liquidity, analyze_momentum
from .market_data import MarketDataError, get_history, get_quote
from .market_universe import get_us_universe
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

    # Signal modes need a wider universe. Previously only 2x the requested
    # result count was scanned, which could easily produce an empty result
    # even when a signal existed later in the universe.
    if mode in {"breakouts", "golden-cross", "volume-surge", "momentum", "liquidity"}:
        scan_size = min(len(universe), max(limit * 4, 40))
    else:
        scan_size = min(len(universe), max(limit * 2, 20))
    universe = universe[:scan_size]

    semaphore = asyncio.Semaphore(8)

    async def scan(symbol: str) -> dict[str, Any] | None:
        async with semaphore:
            try:
                # 260 trading days are required to calculate SMA200 and to
                # make Golden Cross detection meaningful.
                quote, history = await asyncio.gather(
                    get_quote(symbol),
                    get_history(symbol, 260),
                )
            except (MarketDataError, ValueError, TypeError):
                return None

            price = quote.get("price")
            change = quote.get("change_percent")
            if not isinstance(price, (int, float)) or price <= 0:
                return None
            if max_price is not None and price > max_price:
                return None
            if min_change_percent is not None and (
                not isinstance(change, (int, float)) or change < min_change_percent
            ):
                return None

            rows = history or [{"close": price, "volume": quote.get("volume", 0) or 0}]
            try:
                technical = analyze_ohlcv(rows)
                liquidity = analyze_liquidity(rows)
                momentum = analyze_momentum(rows)
                ranking = rank_stock(technical, liquidity, momentum, quote)
            except (ValueError, TypeError, KeyError, IndexError):
                return None

            indicators = technical.get("indicators", {})
            signals = technical.get("signals", {})
            relative_volume = indicators.get("relative_volume20") or 0

            # min_score is a general ranking filter. For signal-specific modes
            # the signal itself is the filter; otherwise a valid signal could
            # disappear simply because its combined ranking score is lower.
            if mode not in {"breakouts", "golden-cross", "volume-surge", "momentum", "liquidity"}:
                if ranking["score"] < min_score:
                    return None

            if mode == "breakouts" and not signals.get("breakout_60d"):
                return None
            if mode == "golden-cross" and not signals.get("golden_cross"):
                return None
            if mode == "volume-surge" and relative_volume < 1.5:
                return None
            if mode == "momentum" and momentum.get("score", 0) < 60:
                return None
            if mode == "liquidity" and liquidity.get("score", 0) < 60:
                return None

            return {
                "symbol": symbol,
                "quote": quote,
                "history_points": len(history),
                "technical": technical,
                "liquidity": liquidity,
                "momentum": momentum,
                "ranking": ranking,
            }

    scanned = await asyncio.gather(*(scan(symbol) for symbol in universe), return_exceptions=False)
    results = [item for item in scanned if item is not None]

    if mode == "top-gainers":
        results.sort(key=lambda x: x.get("quote", {}).get("change_percent", -10**9), reverse=True)
    elif mode == "most-active":
        results.sort(key=lambda x: x.get("quote", {}).get("volume", 0) or 0, reverse=True)
    elif mode == "liquidity":
        results.sort(key=lambda x: x.get("liquidity", {}).get("score", -1), reverse=True)
    elif mode == "momentum":
        results.sort(key=lambda x: x.get("momentum", {}).get("score", -1), reverse=True)
    elif mode == "volume-surge":
        results.sort(key=lambda x: x.get("technical", {}).get("indicators", {}).get("relative_volume20", 0) or 0, reverse=True)
    elif mode == "breakouts":
        results.sort(key=lambda x: x.get("ranking", {}).get("score", -1), reverse=True)
    elif mode == "golden-cross":
        results.sort(key=lambda x: x.get("ranking", {}).get("score", -1), reverse=True)
    else:
        results.sort(key=lambda x: x.get("ranking", {}).get("score", -1), reverse=True)

    return results[: max(1, min(limit, 100))]
