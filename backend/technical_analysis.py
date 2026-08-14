from __future__ import annotations

from typing import Any


def _num(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def sma(values: list[float], period: int) -> float | None:
    return sum(values[-period:]) / period if len(values) >= period else None


def ema(values: list[float], period: int) -> float | None:
    if len(values) < period:
        return None
    k = 2 / (period + 1)
    result = sum(values[:period]) / period
    for value in values[period:]:
        result = value * k + result * (1 - k)
    return result


def rsi(values: list[float], period: int = 14) -> float | None:
    if len(values) <= period:
        return None
    gains, losses = [], []
    for i in range(1, len(values)):
        change = values[i] - values[i - 1]
        gains.append(max(change, 0.0))
        losses.append(max(-change, 0.0))
    gain = sum(gains[:period]) / period
    loss = sum(losses[:period]) / period
    for i in range(period, len(gains)):
        gain = ((period - 1) * gain + gains[i]) / period
        loss = ((period - 1) * loss + losses[i]) / period
    return 100.0 if loss == 0 else 100 - 100 / (1 + gain / loss)


def analyze_ohlcv(rows: list[dict[str, Any]]) -> dict[str, Any]:
    closes = [x for row in rows if (x := _num(row.get("close"))) is not None]
    volumes = [x for row in rows if (x := _num(row.get("volume"))) is not None]
    if not closes:
        raise ValueError("No valid close prices supplied")

    price = closes[-1]
    sma20, sma50, sma200 = sma(closes, 20), sma(closes, 50), sma(closes, 200)
    ema20 = ema(closes, 20)
    rsi14 = rsi(closes)
    ema12, ema26 = ema(closes, 12), ema(closes, 26)
    macd = ema12 - ema26 if ema12 is not None and ema26 is not None else None
    high52, low52 = max(closes[-252:]), min(closes[-252:])
    avg_volume20 = sum(volumes[-20:]) / min(20, len(volumes)) if volumes else None
    relative_volume = volumes[-1] / avg_volume20 if volumes and avg_volume20 else None
    breakout = len(closes) > 60 and price > max(closes[-61:-1])
    golden_cross = sma50 is not None and sma200 is not None and sma50 > sma200

    score = 50.0
    reasons: list[str] = []
    if sma20 and price > sma20:
        score += 7; reasons.append("السعر فوق SMA20")
    if sma50 and price > sma50:
        score += 7; reasons.append("السعر فوق SMA50")
    if golden_cross:
        score += 10; reasons.append("Golden Cross")
    if rsi14 is not None and 50 <= rsi14 <= 70:
        score += 8; reasons.append("RSI إيجابي ومتوازن")
    elif rsi14 is not None and rsi14 > 75:
        score -= 5; reasons.append("RSI مرتفع")
    if relative_volume is not None and relative_volume >= 1.5:
        score += 8; reasons.append("ارتفاع واضح في حجم التداول")
    if breakout:
        score += 10; reasons.append("اختراق قمة 60 جلسة")
    score = max(0.0, min(100.0, score))
    signal = "strong_buy_watch" if score >= 80 else "positive_watch" if score >= 65 else "weak" if score <= 35 else "neutral"

    return {
        "price": price,
        "indicators": {
            "sma20": sma20, "sma50": sma50, "sma200": sma200,
            "ema20": ema20, "rsi14": rsi14, "macd": macd,
            "high52": high52, "low52": low52,
            "relative_volume20": relative_volume,
        },
        "signals": {"golden_cross": golden_cross, "breakout_60d": breakout},
        "technical_score": round(score, 2),
        "signal": signal,
        "reasons": reasons,
    }
