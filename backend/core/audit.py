# backend/core/audit.py
import json
from datetime import datetime
from sqlalchemy.orm import Session

class AuditLogger:
    def __init__(self, db: Session):
        self.db = db
    
    async def log_action(
        self,
        user_id: int,
        action: str,
        details: dict,
        ip_address: str = None,
        user_agent: str = None
    ):
        """تسجيل أي نشاط للمستخدم"""
        log_entry = UserActivityLog(
            user_id=user_id,
            action=action,
            details=json.dumps(details),
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow()
        )
        self.db.add(log_entry)
        self.db.commit()
    
    async def log_trade_execution(
        self,
        user_id: int,
        order_data: dict,
        status: str,
        error: str = None
    ):
        """تسجيل تنفيذ صفقة للتدقيق"""
        audit_entry = ExecutionAudit(
            user_id=user_id,
            order_id=order_data.get("order_id"),
            symbol=order_data.get("symbol"),
            action=order_data.get("action"),
            quantity=order_data.get("quantity"),
            price=order_data.get("price"),
            executed_at=datetime.utcnow(),
            broker_type=order_data.get("broker_type"),
            status=status,
            error_message=error
        )
        self.db.add(audit_entry)
        self.db.commit()
