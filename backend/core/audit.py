from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

try:
    from ..models.models import UserActivityLog
except ImportError:
    from models.models import UserActivityLog


def log_user_activity(db: Session, user_id: int | None, action: str, details: dict[str, Any] | None = None, ip_address: str | None = None, user_agent: str | None = None) -> UserActivityLog:
    record = UserActivityLog(user_id=user_id, action=action, details=details, ip_address=ip_address, user_agent=user_agent)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# Backward-compatible aliases used by older services.
log_audit_event = log_user_activity
log_user_access = log_user_activity
