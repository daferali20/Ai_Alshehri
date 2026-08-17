from __future__ import annotations

import asyncio
from typing import Any

from .ai_ranking import rank_stock
from .breakout_engine import analyze_breakout
from .advanced_liquidity_engine import analyze_advanced_liquidity
from .golden_cross_engine import analyze_golden_cross
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
                breakout = analyze_breakout(rows)
                golden_cross = analyze_golden_cross(rows)
                ranking = rank_stock(technical, liquidity, momentum, quote)
                opportunity = calculate_opportunity(
                    technical,
                    liquidity,
                    momentum,
                    quote,
                    breakout=breakout,
                    golden_cross=golden_cross,
                    advanced_liquidity=advanced_liquidity,
                )
            except (ValueError, TypeError, KeyError, IndexError):
                return None

            indicators = technical.get("indicators", {})
            relative_volume = indicators.get("relative_volume20") or advanced_liquidity.get("relative_volume") or 0
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
                "golden_cross": golden_cross,
                "_relative_volume": relative_volume,
            }

    scanned = await asyncio.gather(*(scan(symbol) for symbol in universe), return_exceptions=False)
    all_results = [item for item in scanned if item is not None]

    results: list[dict[str, Any]]
    if mode == "opportunities":
        results = [x for x in all_results if x["opportunity"]["score"] >= min_score]
        results.sort(key=lambda x: x["opportunity"]["score"], reverse=True)
    elif mode == "breakouts":
        results = [x for x in all_results if x["breakout"].get("score", 0) > 0]
        results.sort(key=lambda x: x["breakout"].get("score", -1), reverse=True)
    elif mode == "golden-cross":
        results = [x for x in all_results if x["golden_cross"].get("score", 0) >= max(min_score, 40)]
        results.sort(key=lambda x: x["golden_cross"].get("score", -1), reverse=True)
    elif mode == "volume-surge":
        results = [x for x in all_results if x.get("_relative_volume", 0) >= 1.0]
        results.sort(key=lambda x: x.get("_relative_volume", 0), reverse=True)
    elif mode == "momentum":
        results = [x for x in all_results if x["momentum"].get("score", 0) >= max(min_score, 50)]
        results.sort(key=lambda x: x["momentum"].get("score", -1), reverse=True)
    elif mode == "liquidity":
        results = [x for x in all_results if x["advanced_liquidity"].get("score", 0) >= max(min_score, 50)]
        results.sort(key=lambda x: x["advanced_liquidity"].get("score", -1), reverse=True)
    elif mode == "top-gainers":
        results = [x for x in all_results if x.get("quote", {}).get("change_percent") is not None]
        results.sort(key=lambda x: x.get("quote", {}).get("change_percent", -10**9), reverse=True)
    else:
        results = [x for x in all_results if x["ranking"]["score"] >= min_score]
        results.sort(key=lambda x: x["quote"].get("volume", 0) or 0, reverse=True)

    if not results and all_results:
        if mode == "golden-cross":
            results = sorted(all_results, key=lambda x: x["golden_cross"].get("score", -1), reverse=True)
        elif mode == "breakouts":
            results = sorted(all_results, key=lambda x: x["breakout"].get("score", -1), reverse=True)
        elif mode == "volume-surge":
            results = sorted(all_results, key=lambda x: x.get("_relative_volume", 0), reverse=True)
        elif mode == "momentum":
            results = sorted(all_results, key=lambda x: x["momentum"].get("score", -1), reverse=True)
        elif mode == "liquidity":
            results = sorted(all_results, key=lambda x: x["advanced_liquidity"].get("score", -1), reverse=True)
        elif mode == "opportunities":
            results = sorted(all_results, key=lambda x: x["opportunity"].get("score", -1), reverse=True)
        else:
            results = sorted(all_results, key=lambda x: x["ranking"].get("score", -1), reverse=True)
        for item in results:
            item["filter_match"] = False
    else:
        for item in results:
            item["filter_match"] = True

    for item in results:
        item.pop("_relative_volume", None)

    return results[: max(1, min(limit, 100))]
