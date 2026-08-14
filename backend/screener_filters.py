from __future__ import annotations

from typing import Any


def filter_stock(item: dict[str, Any], *, min_change: float | None = None, min_relative_volume: float | None = None, min_liquidity_score: float | None = None, min_momentum_score: float | None = None, require_breakout: bool = False, require_golden_cross: bool = False) -> tuple[bool, list[str]]:
    reasons: list[str] = []
    quote = item.get("quote", {})
    technical = item.get("technical", {})
    liquidity = item.get("liquidity", {})
    momentum = item.get("momentum", {})
    change = quote.get("change_percent")
    if min_change is not None and (not isinstance(change, (int, float)) or change < min_change): return False, ["change_percent"]
    relative_volume = technical.get("indicators", {}).get("relative_volume20")
    if min_relative_volume is not None and (not isinstance(relative_volume, (int, float)) or relative_volume < min_relative_volume): return False, ["relative_volume"]
    if min_liquidity_score is not None and float(liquidity.get("score", 0)) < min_liquidity_score: return False, ["liquidity_score"]
    if min_momentum_score is not None and float(momentum.get("score", 0)) < min_momentum_score: return False, ["momentum_score"]
    signals = technical.get("signals", {})
    if require_breakout and not signals.get("breakout_60d", False): return False, ["breakout"]
    if require_golden_cross and not signals.get("golden_cross", False): return False, ["golden_cross"]
    if isinstance(change, (int, float)) and change > 0: reasons.append("positive_change")
    if signals.get("breakout_60d"): reasons.append("breakout")
    if signals.get("golden_cross"): reasons.append("golden_cross")
    if isinstance(relative_volume, (int, float)) and relative_volume >= 1.5: reasons.append("volume_surge")
    return True, reasons
