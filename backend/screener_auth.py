from __future__ import annotations

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models.models import User
from .security import decode_access_token

security = HTTPBearer(auto_error=False)


def require_user(credentials: HTTPAuthorizationCredentials | None = Depends(security), db: Session = Depends(get_db)) -> User:
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
