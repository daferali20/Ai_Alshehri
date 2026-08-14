from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models.models import User
from .security import decode_access_token
from .screener_modes import get_mode, list_modes
from .screener_service import screen_us_stocks

router = APIRouter(prefix="/api/v1/screener", tags=["screener"])
_security = HTTPBearer(auto_error=False)


def _current_user(credentials: HTTPAuthorizationCredentials | None = Depends(_security), db: Session = Depends(get_db)) -> User:
    if not credentials:
        raise HTTPException(401, "المصادقة مطلوبة")
    try:
        user_id = decode_access_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(401, "رمز الدخول غير صالح") from exc
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(401, "المستخدم غير موجود")
    return user


@router.get("/us")
async def screen_us(mode: str = Query("most-active"), user: User = Depends(_current_user), min_score: float = Query(0, ge=0, le=100), min_change_percent: float | None = Query(None, ge=-100, le=1000), max_price: float | None = Query(None, gt=0), limit: int = Query(20, ge=1, le=100)):
    if mode not in list_modes():
        raise HTTPException(400, f"وضع Screener غير معروف: {mode}")
    mode_params = get_mode(mode)
    results = await screen_us_stocks(min_score=max(min_score, mode_params.get("min_score", 0)), min_change_percent=min_change_percent if min_change_percent is not None else mode_params.get("min_change_percent"), max_price=max_price, limit=limit, mode=mode)
    return {"status": "ok", "mode": mode, "results": results}


@router.get("/modes")
async def screener_modes(user: User = Depends(_current_user)):
    return {"modes": list_modes()}
