from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from .main import current_user
from .models.models import User
from .screener_service import screen_us_stocks

router = APIRouter(prefix="/api/v1/screener", tags=["screener"])


@router.get("/us")
async def screen_us(
    user: User = Depends(current_user),
    min_score: float = Query(0, ge=0, le=100),
    min_change_percent: float | None = Query(None, ge=-100, le=1000),
    max_price: float | None = Query(None, gt=0),
    limit: int = Query(20, ge=1, le=100),
):
    return {"status": "ok", "results": await screen_us_stocks(min_score=min_score, min_change_percent=min_change_percent, max_price=max_price, limit=limit)}
