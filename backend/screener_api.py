from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from .screener_modes import get_mode, list_modes
from .screener_service import screen_us_stocks

router = APIRouter(prefix="/api/v1/screener", tags=["screener"])


@router.get("/us")
async def screen_us(
    mode: str = Query("most-active"),
    min_score: float = Query(0, ge=0, le=100),
    min_change_percent: float | None = Query(None, ge=-100, le=1000),
    max_price: float | None = Query(None, gt=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Read-only public screener used by the dashboard."""
    if mode not in list_modes():
        raise HTTPException(400, f"وضع Screener غير معروف: {mode}")

    mode_params = get_mode(mode)
    results = await screen_us_stocks(
        min_score=max(min_score, mode_params.get("min_score", 0)),
        min_change_percent=(
            min_change_percent
            if min_change_percent is not None
            else mode_params.get("min_change_percent")
        ),
        max_price=max_price,
        limit=limit,
        mode=mode,
    )
    return {"status": "ok", "mode": mode, "results": results}


@router.get("/modes")
async def screener_modes():
    return {"modes": list_modes()}
