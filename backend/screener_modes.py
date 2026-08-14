from __future__ import annotations

SCREENER_MODES = {
    "top-gainers": {"min_change_percent": 5},
    "most-active": {},
    "volume-surge": {"min_score": 60},
    "breakouts": {"min_score": 65},
    "golden-cross": {"min_score": 65},
    "momentum": {"min_score": 60},
    "liquidity": {"min_score": 60},
}


def get_mode(name: str) -> dict:
    return SCREENER_MODES.get(name, {})


def list_modes() -> list[str]:
    return list(SCREENER_MODES)
