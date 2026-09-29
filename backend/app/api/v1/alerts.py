from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from backend.app.db.session import get_db
from backend.app.db.models import Alert, Project, User
from backend.app.api.v1.auth import get_current_user, require_roles
from backend.app.services.project_service import apply_rbac_scope
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/alerts", tags=["Early Warning Center"])


class AlertStatusUpdate(BaseModel):
    status: str  # Acknowledged | Resolved
    resolution_notes: Optional[str] = None


@router.get("")
def list_alerts(
    status: Optional[str] = Query(None, regex="^(Open|Acknowledged|Resolved)$"),
    severity: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).join(Alert.project).options(
        joinedload(Alert.project).joinedload(Project.sector),
        joinedload(Alert.project).joinedload(Project.state),
        joinedload(Alert.project).joinedload(Project.ministry)
    )

    # Scoped projects
    scoped_projects = apply_rbac_scope(db.query(Project.id), current_user).subquery()
    query = query.filter(Alert.project_id.in_(scoped_projects))

    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)

    alerts = query.order_by(desc(Alert.created_at)).limit(limit).all()

    return [
        {
            "id": a.id,
            "project_id": a.project_id,
            "project_code": a.project.project_code,
            "project_name": a.project.name,
            "sector": a.project.sector.name if a.project.sector else None,
            "state": a.project.state.name if a.project.state else None,
            "ministry": a.project.ministry.short_name if a.project.ministry else None,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "explanation": a.explanation,
            "evidence": a.evidence,
            "status": a.status,
            "created_at": a.created_at.isoformat()
        }
        for a in alerts
    ]


@router.patch("/{alert_id}")
def update_alert_status(
    alert_id: int,
    payload: AlertStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    before_state = {"status": alert.status}
    alert.status = payload.status
    db.commit()

    log_audit_event(
        db=db,
        action=f"ALERT_{payload.status.upper()}",
        user_id=current_user.id,
        entity_type="Alert",
        entity_id=str(alert.id),
        before=before_state,
        after={"status": alert.status, "notes": payload.resolution_notes}
    )

    return {"message": f"Alert marked as {payload.status}", "alert_id": alert.id, "status": alert.status}
