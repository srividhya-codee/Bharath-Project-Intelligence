import datetime
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from backend.app.db.models import AuditLog


def log_audit_event(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    before: Optional[Dict[str, Any]] = None,
    after: Optional[Dict[str, Any]] = None,
    ip: Optional[str] = None,
    user_agent: Optional[str] = None
) -> AuditLog:
    """Records an immutable security and administrative audit event."""
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        before=before,
        after=after,
        ip=ip,
        user_agent=user_agent,
        created_at=datetime.datetime.utcnow()
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
