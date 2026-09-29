from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from backend.app.db.session import get_db
from backend.app.db.models import AuditLog, User
from backend.app.api.v1.auth import require_roles

router = APIRouter(prefix="/audit-logs", tags=["Audit & Governance"])


@router.get("")
def list_audit_logs(
    action: Optional[str] = None,
    user_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_roles(["Super Admin"])),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog).options(joinedload(AuditLog.user))

    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    logs = query.order_by(desc(AuditLog.created_at)).limit(limit).all()

    return [
        {
            "id": l.id,
            "action": l.action,
            "user_id": l.user_id,
            "user_name": l.user.name if l.user else "System",
            "user_email": l.user.email if l.user else None,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "before": l.before,
            "after": l.after,
            "ip": l.ip,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]
