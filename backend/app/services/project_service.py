from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func

from backend.app.db.models import Project, ProgressUpdate, FinancialRecord, Prediction, Risk, Issue, Milestone, User
from backend.app.services.metrics import compute_all_project_metrics


def apply_rbac_scope(query, user: User):
    """Restricts project queries according to User role and organizational scope."""
    if user.role == "Super Admin" or user.role == "Senior Decision Maker":
        return query  # National visibility

    if user.role == "Government Officer":
        if user.ministry_id:
            query = query.filter(Project.ministry_id == user.ministry_id)
        if user.state_id:
            query = query.filter(Project.state_id == user.state_id)
        return query

    if user.role == "Project Authority":
        # Scoped to assigned projects or manager state/agency
        conditions = []
        if user.id:
            conditions.append(Project.project_manager_id == user.id)
        if user.state_id and user.ministry_id:
            conditions.append(and_(Project.state_id == user.state_id, Project.ministry_id == user.ministry_id))
        elif user.state_id:
            conditions.append(Project.state_id == user.state_id)

        if conditions:
            query = query.filter(or_(*conditions))
        return query

    return query


def get_latest_project_progress(project: Project) -> Dict[str, float]:
    """Retrieves or estimates the latest physical and financial progress."""
    latest_update = None
    if project.progress_updates:
        latest_update = sorted(project.progress_updates, key=lambda x: x.period_end, reverse=True)[0]

    if latest_update:
        return {
            "planned_physical_pct": latest_update.planned_physical_pct,
            "actual_physical_pct": latest_update.actual_physical_pct,
            "financial_progress_pct": latest_update.financial_progress_pct
        }

    # Fallback to cost/date ratios
    spend_pct = (project.expenditure_cr / project.approved_cost_cr * 100) if project.approved_cost_cr > 0 else 0.0
    return {
        "planned_physical_pct": 50.0,
        "actual_physical_pct": min(100.0, spend_pct * 0.9),
        "financial_progress_pct": min(100.0, spend_pct)
    }


def format_project_summary(project: Project) -> Dict[str, Any]:
    """Formats project with all computed EVM metrics, prediction summaries, and latest status."""
    progress = get_latest_project_progress(project)
    metrics = compute_all_project_metrics(
        approved_cost_cr=project.approved_cost_cr,
        revised_cost_cr=project.revised_cost_cr,
        expenditure_cr=project.expenditure_cr,
        planned_physical_pct=progress["planned_physical_pct"],
        actual_physical_pct=progress["actual_physical_pct"],
        financial_progress_pct=progress["financial_progress_pct"],
        planned_date=project.planned_completion_date,
        expected_date=project.expected_completion_date
    )

    # Get latest prediction if available
    pred = project.predictions[0] if project.predictions else None

    return {
        "id": project.id,
        "project_code": project.project_code,
        "name": project.name,
        "description": project.description,
        "ministry_id": project.ministry_id,
        "ministry_name": project.ministry.name if project.ministry else None,
        "ministry_code": project.ministry.code if project.ministry else None,
        "sector_id": project.sector_id,
        "sector_name": project.sector.name if project.sector else None,
        "state_id": project.state_id,
        "state_name": project.state.name if project.state else None,
        "state_code": project.state.code if project.state else None,
        "agency_id": project.implementing_agency_id,
        "agency_name": project.implementing_agency.name if project.implementing_agency else None,
        "agency_type": project.implementing_agency.type if project.implementing_agency else None,
        "contractor_name": project.contractor_name,
        "approved_cost_cr": project.approved_cost_cr,
        "revised_cost_cr": project.revised_cost_cr,
        "expenditure_cr": project.expenditure_cr,
        "start_date": project.start_date.isoformat(),
        "planned_completion_date": project.planned_completion_date.isoformat(),
        "expected_completion_date": project.expected_completion_date.isoformat(),
        "actual_completion_date": project.actual_completion_date.isoformat() if project.actual_completion_date else None,
        "status": project.status,
        "latitude": project.latitude,
        "longitude": project.longitude,
        "is_synthetic": project.is_synthetic,
        # Progress and EVM metrics
        "planned_physical_pct": progress["planned_physical_pct"],
        "actual_physical_pct": progress["actual_physical_pct"],
        "financial_progress_pct": progress["financial_progress_pct"],
        "spi": metrics["spi"],
        "cpi": metrics["cpi"],
        "physical_progress_gap": metrics["physical_progress_gap"],
        "financial_physical_gap": metrics["financial_physical_gap"],
        "budget_utilisation_pct": metrics["budget_utilisation_pct"],
        "cost_overrun_pct": metrics["cost_overrun_pct"],
        "time_overrun_days": metrics["time_overrun_days"],
        "is_delayed": metrics["is_delayed"],
        # Prediction
        "risk_score": pred.risk_score if pred else 25.0,
        "risk_band": pred.risk_band if pred else "Low",
        "predicted_delay_days": pred.predicted_delay_days if pred else 0,
        "predicted_cost_overrun_pct": pred.predicted_cost_overrun_pct if pred else 0.0,
        "top_factors": pred.top_factors if pred else []
    }
