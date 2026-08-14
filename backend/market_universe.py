from __future__ import annotations

# Curated liquid US symbols. This is intentionally a maintainable baseline;
# a future provider can replace it with a dynamic exchange/universe feed.
US_LIQUID_SYMBOLS = [
    "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "GOOG", "AVGO", "TSLA", "BRK.B",
    "JPM", "LLY", "V", "XOM", "UNH", "MA", "COST", "HD", "PG", "JNJ", "NFLX", "CRM",
    "ORCL", "AMD", "QCOM", "ADBE", "INTC", "MU", "AMAT", "PANW", "PLTR", "CRWD", "NOW",
    "UBER", "SHOP", "COIN", "HOOD", "SMCI", "ARM", "MSTR", "SNOW", "RBLX", "SOFI", "NIO",
]


def get_us_universe(limit: int | None = None) -> list[str]:
    symbols = US_LIQUID_SYMBOLS.copy()
    return symbols if limit is None or limit <= 0 else symbols[:limit]
