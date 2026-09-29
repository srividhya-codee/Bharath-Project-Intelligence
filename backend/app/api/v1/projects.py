import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc

from backend.app.db.session import get_db
from backend.app.db.models import (
    Project, Milestone, ProgressUpdate, FinancialRecord,
    Risk, Issue, Prediction, User, State, Ministry, Sector
)
from backend.app.api.v1.auth import get_current_user, require_roles
from backend.app.services.project_service import apply_rbac_scope, format_project_summary
from backend.app.services.alerts_engine import evaluate_and_generate_alerts
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/projects", tags=["Projects Management"])

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class ProgressUpdateCreate(BaseModel):
    period_end: datetime.date
    planned_physical_pct: float = Field(..., ge=0.0, le=100.0)
    actual_physical_pct: float = Field(..., ge=0.0, le=100.0)
    financial_progress_pct: float = Field(..., ge=0.0, le=100.0)
    remarks: Optional[str] = None
    justification_for_decrease: Optional[str] = None

class MilestoneUpdate(BaseModel):
    status: Optional[str] = None  # Pending | In Progress | Completed | Delayed
    expected_date: Optional[datetime.date] = None
    actual_date: Optional[datetime.date] = None

class IssueCreate(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(BaseModel):
    project_code: str
    name: str
    description: Optional[str] = None
    ministry_id: int
    sector_id: int
    state_id: int
    implementing_agency_id: int
    approved_cost_cr: float
    start_date: datetime.date
    planned_completion_date: datetime.date
    expected_completion_date: datetime.date
    contractor_name: Optional[str] = None


# -------------------------------------------------------------
# ROUTES
# -------------------------------------------------------------
@router.get("")
def list_projects(
    ministry: Optional[str] = None,
    state: Optional[str] = None,
    sector: Optional[str] = None,
    status: Optional[str] = None,
    risk_band: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    sort_by: str = Query("id", regex="^(id|approved_cost_cr|expenditure_cr|start_date|project_code)$"),
    order: str = Query("asc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project).options(
        joinedload(Project.ministry),
        joinedload(Project.state),
        joinedload(Project.sector),
        joinedload(Project.implementing_agency),
        joinedload(Project.progress_updates),
        joinedload(Project.predictions)
    )

    query = apply_rbac_scope(query, current_user)

    if ministry:
        query = query.join(Project.ministry).filter(or_(Ministry.code == ministry, Ministry.name.ilike(f"%{ministry}%")))
    if state:
        query = query.join(Project.state).filter(or_(State.code == state, State.name.ilike(f"%{state}%")))
    if sector:
        query = query.join(Project.sector).filter(Sector.name.ilike(f"%{sector}%"))
    if status:
        query = query.filter(Project.status.ilike(status))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(or_(Project.project_code.ilike(search_pattern), Project.name.ilike(search_pattern)))

    total = query.count()

    # Sort
    sort_column = getattr(Project, sort_by)
    query = query.order_by(desc(sort_column) if order == "desc" else asc(sort_column))

    # Pagination
    offset = (page - 1) * limit
    projects = query.offset(offset).limit(limit).all()

    formatted = [format_project_summary(p) for p in projects]

    # In-memory filter for risk_band if requested
    if risk_band:
        formatted = [p for p in formatted if p["risk_band"].lower() == risk_band.lower()]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "projects": formatted
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(require_roles(["Super Admin", "Project Authority"])),
    db: Session = Depends(get_db)
):
    existing = db.query(Project).filter(Project.project_code == payload.project_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project code already registered")

    project = Project(
        project_code=payload.project_code,
        name=payload.name,
        description=payload.description,
        ministry_id=payload.ministry_id,
        sector_id=payload.sector_id,
        state_id=payload.state_id,
        implementing_agency_id=payload.implementing_agency_id,
        contractor_name=payload.contractor_name,
        project_manager_id=current_user.id,
        approved_cost_cr=payload.approved_cost_cr,
        expenditure_cr=0.0,
        start_date=payload.start_date,
        planned_completion_date=payload.planned_completion_date,
        expected_completion_date=payload.expected_completion_date,
        status="Active",
        is_synthetic=True
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    log_audit_event(
        db=db,
        action="PROJECT_CREATED",
        user_id=current_user.id,
        entity_type="Project",
        entity_id=str(project.id),
        after={"project_code": project.project_code, "name": project.name}
    )

    return {"message": "Project created successfully", "project": format_project_summary(project)}


@router.get("/{project_id_or_code}")
def get_project_360(
    project_id_or_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project).options(
        joinedload(Project.ministry),
        joinedload(Project.state),
        joinedload(Project.sector),
        joinedload(Project.implementing_agency),
        joinedload(Project.milestones),
        joinedload(Project.progress_updates),
        joinedload(Project.financial_records),
        joinedload(Project.risks),
        joinedload(Project.issues),
        joinedload(Project.predictions),
        joinedload(Project.alerts),
        joinedload(Project.documents)
    )

    if project_id_or_code.isdigit():
        project = query.filter(Project.id == int(project_id_or_code)).first()
    else:
        project = query.filter(Project.project_code.ilike(project_id_or_code)).first()

    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id_or_code}' not found")

    summary = format_project_summary(project)

    return {
        "project": summary,
        "milestones": [
            {
                "id": m.id,
                "name": m.name,
                "planned_date": m.planned_date.isoformat(),
                "expected_date": m.expected_date.isoformat(),
                "actual_date": m.actual_date.isoformat() if m.actual_date else None,
                "weight_pct": m.weight_pct,
                "status": m.status
            }
            for m in sorted(project.milestones, key=lambda x: x.planned_date)
        ],
        "progress_updates": [
            {
                "id": p.id,
                "period_end": p.period_end.isoformat(),
                "planned_physical_pct": p.planned_physical_pct,
                "actual_physical_pct": p.actual_physical_pct,
                "financial_progress_pct": p.financial_progress_pct,
                "remarks": p.remarks,
                "submitted_by": p.submitted_by,
                "submitted_at": p.submitted_at.isoformat()
            }
            for p in sorted(project.progress_updates, key=lambda x: x.period_end, reverse=True)
        ],
        "financial_records": [
            {
                "id": f.id,
                "fiscal_year": f.fiscal_year,
                "quarter": f.quarter,
                "allocated_cr": f.allocated_cr,
                "released_cr": f.released_cr,
                "expended_cr": f.expended_cr
            }
            for f in project.financial_records
        ],
        "risks": [
            {
                "id": r.id,
                "category": r.category,
                "severity": r.severity,
                "description": r.description,
                "status": r.status
            }
            for r in project.risks
        ],
        "issues": [
            {
                "id": i.id,
                "title": i.title,
                "description": i.description,
                "raised_by": i.raised_by,
                "raised_at": i.raised_at.isoformat(),
                "status": i.status,
                "resolution": i.resolution
            }
            for i in project.issues
        ],
        "documents": [
            {
                "id": d.id,
                "title": d.title,
                "doc_type": d.doc_type,
                "file_path": d.file_path,
                "uploaded_at": d.uploaded_at.isoformat()
            }
            for d in project.documents
        ]
    }


@router.post("/{project_id}/progress")
def submit_progress_update(
    project_id: int,
    payload: ProgressUpdateCreate,
    current_user: User = Depends(require_roles(["Super Admin", "Project Authority"])),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Anti-Regression validation check: Progress cannot decrease without justification
    latest_update = (
        db.query(ProgressUpdate)
        .filter(ProgressUpdate.project_id == project.id)
        .order_by(ProgressUpdate.period_end.desc())
        .first()
    )
    if latest_update and payload.actual_physical_pct < latest_update.actual_physical_pct:
        if not payload.justification_for_decrease or len(payload.justification_for_decrease.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Physical progress cannot decrease without a documented justification (minimum 10 characters)."
            )

    update = ProgressUpdate(
        project_id=project.id,
        period_end=payload.period_end,
        planned_physical_pct=payload.planned_physical_pct,
        actual_physical_pct=payload.actual_physical_pct,
        financial_progress_pct=payload.financial_progress_pct,
        remarks=f"{payload.remarks or ''} {'[De-rate Justification: ' + payload.justification_for_decrease + ']' if payload.justification_for_decrease else ''}".strip(),
        submitted_by=current_user.name,
        submitted_at=datetime.datetime.utcnow()
    )
    db.add(update)

    # Sync project expenditure
    project.expenditure_cr = round(project.approved_cost_cr * (payload.financial_progress_pct / 100.0), 2)
    db.commit()

    # Re-evaluate early-warning rules automatically
    evaluate_and_generate_alerts(db, project)

    log_audit_event(
        db=db,
        action="PROGRESS_UPDATE_SUBMITTED",
        user_id=current_user.id,
        entity_type="Project",
        entity_id=str(project.id),
        after={"actual_physical_pct": payload.actual_physical_pct, "financial_progress_pct": payload.financial_progress_pct}
    )

    return {"message": "Progress update recorded successfully", "id": update.id}


@router.patch("/milestones/{milestone_id}")
def update_milestone(
    milestone_id: int,
    payload: MilestoneUpdate,
    current_user: User = Depends(require_roles(["Super Admin", "Project Authority"])),
    db: Session = Depends(get_db)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    before_state = {"status": milestone.status, "expected_date": milestone.expected_date.isoformat()}

    if payload.status:
        milestone.status = payload.status
    if payload.expected_date:
        milestone.expected_date = payload.expected_date
    if payload.actual_date:
        milestone.actual_date = payload.actual_date

    db.commit()

    log_audit_event(
        db=db,
        action="MILESTONE_UPDATED",
        user_id=current_user.id,
        entity_type="Milestone",
        entity_id=str(milestone.id),
        before=before_state,
        after={"status": milestone.status, "expected_date": milestone.expected_date.isoformat()}
    )

    return {"message": "Milestone updated successfully"}


@router.post("/{project_id}/issues")
def create_issue(
    project_id: int,
    payload: IssueCreate,
    current_user: User = Depends(require_roles(["Super Admin", "Project Authority"])),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    issue = Issue(
        project_id=project.id,
        title=payload.title,
        description=payload.description,
        raised_by=current_user.name,
        raised_at=datetime.datetime.utcnow(),
        status="Open"
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)

    return {"message": "Issue raised successfully", "issue_id": issue.id}
