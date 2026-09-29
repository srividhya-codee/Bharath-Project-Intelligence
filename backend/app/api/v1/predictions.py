from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from backend.app.db.session import get_db
from backend.app.db.models import Prediction, Project, User
from backend.app.api.v1.auth import get_current_user, require_roles
from backend.app.services.alerts_engine import evaluate_and_generate_alerts
from backend.app.services.project_service import format_project_summary

router = APIRouter(prefix="/predictions", tags=["Predictive Analytics & Forecaster"])


@router.get("/next-quarter-delays")
def get_next_quarter_delays(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Identifies projects forecasted to face schedule slippage in the upcoming quarter."""
    predictions = (
        db.query(Prediction)
        .join(Prediction.project)
        .options(joinedload(Prediction.project))
        .filter(Prediction.predicted_delay_days > 45)
        .order_by(desc(Prediction.predicted_delay_days))
        .all()
    )

    return [
        {
            "project_code": p.project.project_code,
            "project_name": p.project.name,
            "risk_score": p.risk_score,
            "risk_band": p.risk_band,
            "predicted_delay_days": p.predicted_delay_days,
            "predicted_cost_overrun_pct": p.predicted_cost_overrun_pct,
            "top_factors": p.top_factors,
            "disclaimer": p.disclaimer
        }
        for p in predictions
    ]


@router.get("/{project_id_or_code}")
def get_project_prediction(
    project_id_or_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if project_id_or_code.isdigit():
        project = query.filter(Project.id == int(project_id_or_code)).first()
    else:
        project = query.filter(Project.project_code.ilike(project_id_or_code)).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    pred = (
        db.query(Prediction)
        .filter(Prediction.project_id == project.id)
        .order_by(desc(Prediction.generated_at))
        .first()
    )

    if not pred:
        # Generate baseline on the fly
        return {
            "project_code": project.project_code,
            "risk_score": 25.0,
            "risk_band": "Low",
            "predicted_delay_days": 0,
            "predicted_cost_overrun_pct": 0.0,
            "top_factors": [],
            "disclaimer": "AI Prediction, not a confirmed fact"
        }

    return {
        "project_code": project.project_code,
        "risk_score": pred.risk_score,
        "risk_band": pred.risk_band,
        "predicted_delay_days": pred.predicted_delay_days,
        "predicted_cost_overrun_pct": pred.predicted_cost_overrun_pct,
        "top_factors": pred.top_factors,
        "disclaimer": pred.disclaimer,
        "generated_at": pred.generated_at.isoformat()
    }


@router.post("/recompute")
def recompute_all_predictions(
    admin: User = Depends(require_roles(["Super Admin"])),
    db: Session = Depends(get_db)
):
    """Batch recomputes predictions and re-evaluates early warnings for all active projects."""
    projects = db.query(Project).all()
    count = 0
    alerts_triggered = 0

    for p in projects:
        alerts = evaluate_and_generate_alerts(db, p)
        alerts_triggered += len(alerts)
        count += 1

    return {
        "message": f"Successfully recomputed metrics for {count} projects.",
        "projects_evaluated": count,
        "new_alerts_dispatched": alerts_triggered
    }
