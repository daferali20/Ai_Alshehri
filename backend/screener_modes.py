from __future__ import annotations

# Signal modes use their own signal/threshold instead of requiring a high
# composite ranking score first. This prevents valid breakouts and Golden
# Cross setups from being filtered out prematurely.
SCREENER_MODES = {
    "top-gainers": {"min_change_percent": 5},
    "most-active": {},
    "volume-surge": {},
    "breakouts": {},
    "golden-cross": {},
    "momentum": {"min_score": 60},
    "liquidity": {},
    "opportunities": {"min_score": 60},
}


def get_mode(name: str) -> dict:
    return SCREENER_MODES.get(name, {})


def list_modes() -> list[str]:
    return list(SCREENER_MODES)
