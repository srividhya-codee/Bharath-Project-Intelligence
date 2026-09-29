from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.db.session import SessionLocal
from backend.app.db.models import (
    Project, Milestone, ProgressUpdate, FinancialRecord,
    Risk, Issue, Document, Prediction, Alert, AuditLog, State, Ministry, Sector
)
from backend.app.services.metrics import compute_all_project_metrics, calculate_spi, calculate_cpi
from backend.app.services.project_service import format_project_summary
from backend.app.rag.retriever import hybrid_search_documents


# 1. get_project_summary
def get_project_summary(project_code: str) -> Dict[str, Any]:
    """Fetches high-level executive summary, health indicators, EVM metrics, and prediction for a project."""
    db: Session = SessionLocal()
    try:
        p = db.query(Project).filter(Project.project_code.ilike(project_code.strip())).first()
        if not p:
            return {"error": f"Project '{project_code}' not found."}
        return format_project_summary(p)
    finally:
        db.close()


# 2. get_project_milestones
def get_project_milestones(project_code: str) -> Dict[str, Any]:
    """Retrieves milestone schedule, target dates, slippage, and completion status for a project."""
    db: Session = SessionLocal()
    try:
        p = db.query(Project).filter(Project.project_code.ilike(project_code.strip())).first()
        if not p:
            return {"error": f"Project '{project_code}' not found."}
        return {
            "project_code": p.project_code,
            "project_name": p.name,
            "milestones": [
                {
                    "name": m.name,
                    "planned_date": m.planned_date.isoformat(),
                    "expected_date": m.expected_date.isoformat(),
                    "actual_date": m.actual_date.isoformat() if m.actual_date else None,
                    "delay_days": (m.expected_date - m.planned_date).days,
                    "weight_pct": m.weight_pct,
                    "status": m.status
                }
                for m in sorted(p.milestones, key=lambda x: x.planned_date)
            ]
        }
    finally:
        db.close()


# 3. get_project_financials
def get_project_financials(project_code: str) -> Dict[str, Any]:
    """Retrieves budget allocations, releases, expenditures, and utilization for a project."""
    db: Session = SessionLocal()
    try:
        p = db.query(Project).filter(Project.project_code.ilike(project_code.strip())).first()
        if not p:
            return {"error": f"Project '{project_code}' not found."}
        return {
            "project_code": p.project_code,
            "approved_cost_cr": p.approved_cost_cr,
            "revised_cost_cr": p.revised_cost_cr,
            "expenditure_cr": p.expenditure_cr,
            "utilisation_pct": round((p.expenditure_cr / max(1.0, p.approved_cost_cr)) * 100, 2),
            "quarterly_records": [
                {
                    "fiscal_year": f.fiscal_year,
                    "quarter": f.quarter,
                    "allocated_cr": f.allocated_cr,
                    "released_cr": f.released_cr,
                    "expended_cr": f.expended_cr
                }
                for f in p.financial_records
            ]
        }
    finally:
        db.close()


# 4. get_project_risks
def get_project_risks(project_code: str) -> Dict[str, Any]:
    """Retrieves the active and mitigated risk register for a project, including land and environmental bottlenecks."""
    db: Session = SessionLocal()
    try:
        p = db.query(Project).filter(Project.project_code.ilike(project_code.strip())).first()
        if not p:
            return {"error": f"Project '{project_code}' not found."}
        return {
            "project_code": p.project_code,
            "risks": [
                {
                    "category": r.category,
                    "severity": r.severity,
                    "description": r.description,
                    "status": r.status
                }
                for r in p.risks
            ]
        }
    finally:
        db.close()


# 5. get_project_issues
def get_project_issues(project_code: str) -> Dict[str, Any]:
    """Retrieves logged operational site bottlenecks, contractor disputes, and pending resolutions."""
    db: Session = SessionLocal()
    try:
        p = db.query(Project).filter(Project.project_code.ilike(project_code.strip())).first()
        if not p:
            return {"error": f"Project '{project_code}' not found."}
        return {
            "project_code": p.project_code,
            "issues": [
                {
                    "title": i.title,
                    "description": i.description,
                    "raised_by": i.raised_by,
                    "raised_at": i.raised_at.isoformat(),
                    "status": i.status,
                    "resolution": i.resolution
                }
                for i in p.issues
            ]
        }
    finally:
        db.close()


# 6. get_project_documents
def get_project_documents(project_code: str) -> Dict[str, Any]:
    """Lists indexed documents, DPRs, inspection reports, and circulars associated with a project."""
    db: Session = SessionLocal()
    try:
        p = db.query(Project).filter(Project.project_code.ilike(project_code.strip())).first()
        if not p:
            return {"error": f"Project '{project_code}' not found."}
        return {
            "project_code": p.project_code,
            "documents": [
                {
                    "title": d.title,
                    "doc_type": d.doc_type,
                    "sensitivity": d.sensitivity_level,
                    "uploaded_at": d.uploaded_at.isoformat()
                }
                for d in p.documents
            ]
        }
    finally:
        db.close()


# 7. get_project_prediction
def get_project_prediction(project_code: str) -> Dict[str, Any]:
    """Fetches ML risk score, forecasted delay in days, cost overrun probability, and SHAP top factors."""
    db: Session = SessionLocal()
    try:
        p = db.query(Project).filter(Project.project_code.ilike(project_code.strip())).first()
        if not p:
            return {"error": f"Project '{project_code}' not found."}
        pred = p.predictions[0] if p.predictions else None
        if not pred:
            return {"project_code": p.project_code, "risk_score": 25.0, "risk_band": "Low", "top_factors": []}
        return {
            "project_code": p.project_code,
            "risk_score": pred.risk_score,
            "risk_band": pred.risk_band,
            "predicted_delay_days": pred.predicted_delay_days,
            "predicted_delay_months": round(pred.predicted_delay_days / 30.4, 1),
            "predicted_cost_overrun_pct": pred.predicted_cost_overrun_pct,
            "top_factors": pred.top_factors,
            "disclaimer": pred.disclaimer
        }
    finally:
        db.close()


# 8. search_project_documents
def search_project_documents(query: str, project_code: Optional[str] = None, top_k: int = 4) -> List[Dict[str, Any]]:
    """Performs semantic vector search over DPRs, inspection notes, and government circulars."""
    return hybrid_search_documents(query=query, project_code=project_code, top_k=top_k)


# 9. compare_projects
def compare_projects(project_codes: List[str]) -> Dict[str, Any]:
    """Performs side-by-side comparative benchmarking between 2 or more projects."""
    db: Session = SessionLocal()
    try:
        results = []
        for code in project_codes:
            p = db.query(Project).filter(Project.project_code.ilike(code.strip())).first()
            if p:
                results.append(format_project_summary(p))
        return {"compared_count": len(results), "projects": results}
    finally:
        db.close()


# 10. get_projects_by_state
def get_projects_by_state(state_code: str) -> Dict[str, Any]:
    """Retrieves all infrastructure projects in a specific Indian state (e.g. TN, MH, UP, KA)."""
    db: Session = SessionLocal()
    try:
        st = db.query(State).filter((State.code.ilike(state_code.strip())) | (State.name.ilike(f"%{state_code.strip()}%"))).first()
        if not st:
            return {"error": f"State '{state_code}' not recognized."}
        projects = db.query(Project).filter(Project.state_id == st.id).all()
        return {
            "state_name": st.name,
            "state_code": st.code,
            "count": len(projects),
            "projects": [format_project_summary(p) for p in projects]
        }
    finally:
        db.close()


# 11. get_projects_by_ministry
def get_projects_by_ministry(ministry_code: str) -> Dict[str, Any]:
    """Retrieves all projects sanctioned under a specific union ministry (e.g. MoRTH, MoR, MoCA)."""
    db: Session = SessionLocal()
    try:
        m = db.query(Ministry).filter((Ministry.code.ilike(ministry_code.strip())) | (Ministry.short_name.ilike(ministry_code.strip()))).first()
        if not m:
            return {"error": f"Ministry '{ministry_code}' not recognized."}
        projects = db.query(Project).filter(Project.ministry_id == m.id).all()
        return {
            "ministry_name": m.name,
            "ministry_code": m.code,
            "count": len(projects),
            "projects": [format_project_summary(p) for p in projects]
        }
    finally:
        db.close()


# 12. get_projects_by_sector
def get_projects_by_sector(sector_name: str) -> Dict[str, Any]:
    """Filters projects by infrastructure sector (e.g. Roads & Highways, Railways, Urban Development)."""
    db: Session = SessionLocal()
    try:
        sec = db.query(Sector).filter(Sector.name.ilike(f"%{sector_name.strip()}%")).first()
        if not sec:
            return {"error": f"Sector '{sector_name}' not found."}
        projects = db.query(Project).filter(Project.sector_id == sec.id).all()
        return {
            "sector_name": sec.name,
            "count": len(projects),
            "projects": [format_project_summary(p) for p in projects]
        }
    finally:
        db.close()


# 13. get_high_risk_projects
def get_high_risk_projects(threshold: float = 60.0) -> Dict[str, Any]:
    """Identifies projects where ML risk score exceeds threshold (default: High/Critical risk >= 60)."""
    db: Session = SessionLocal()
    try:
        preds = db.query(Prediction).filter(Prediction.risk_score >= threshold).order_by(desc(Prediction.risk_score)).all()
        items = []
        for pr in preds:
            items.append({
                "project_code": pr.project.project_code,
                "project_name": pr.project.name,
                "state": pr.project.state.name if pr.project.state else None,
                "ministry": pr.project.ministry.short_name if pr.project.ministry else None,
                "risk_score": pr.risk_score,
                "risk_band": pr.risk_band,
                "predicted_delay_days": pr.predicted_delay_days,
                "top_factors": pr.top_factors
            })
        return {"threshold": threshold, "count": len(items), "projects": items}
    finally:
        db.close()


# 14. get_early_warning_alerts
def get_early_warning_alerts(severity: Optional[str] = None, status: str = "Open") -> Dict[str, Any]:
    """Retrieves active early warning alerts generated by EVM and ML triggers."""
    db: Session = SessionLocal()
    try:
        q = db.query(Alert).filter(Alert.status == status)
        if severity:
            q = q.filter(Alert.severity.ilike(severity))
        alerts = q.order_by(desc(Alert.created_at)).limit(25).all()
        return {
            "count": len(alerts),
            "alerts": [
                {
                    "project_code": a.project.project_code,
                    "title": a.title,
                    "severity": a.severity,
                    "status": a.status,
                    "created_at": a.created_at.isoformat()
                }
                for a in alerts
            ]
        }
    finally:
        db.close()


# 15. get_audit_log_summary
def get_audit_log_summary(limit: int = 15) -> Dict[str, Any]:
    """Retrieves recent administrative and security audit events."""
    db: Session = SessionLocal()
    try:
        logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()
        return {
            "count": len(logs),
            "recent_actions": [
                {
                    "action": l.action,
                    "entity_type": l.entity_type,
                    "user_id": l.user_id,
                    "timestamp": l.created_at.isoformat()
                }
                for l in logs
            ]
        }
    finally:
        db.close()


# 16. calculate_evm_metrics
def calculate_evm_metrics(
    planned_physical_pct: float,
    actual_physical_pct: float,
    approved_cost_cr: float,
    expenditure_cr: float
) -> Dict[str, Any]:
    """Computes exact Earned Value Management formulas (SPI, CPI, gaps, cost overrun)."""
    spi = calculate_spi(actual_physical_pct, planned_physical_pct)
    fin_pct = round((expenditure_cr / max(0.1, approved_cost_cr)) * 100, 2)
    cpi = calculate_cpi(actual_physical_pct, fin_pct)
    return {
        "spi": spi,
        "cpi": cpi,
        "planned_physical_pct": planned_physical_pct,
        "actual_physical_pct": actual_physical_pct,
        "physical_gap": round(planned_physical_pct - actual_physical_pct, 2),
        "financial_physical_gap": round(fin_pct - actual_physical_pct, 2),
        "budget_utilisation_pct": fin_pct
    }


# Map of all available tools for agent dispatch
TOOL_REGISTRY = {
    "get_project_summary": get_project_summary,
    "get_project_milestones": get_project_milestones,
    "get_project_financials": get_project_financials,
    "get_project_risks": get_project_risks,
    "get_project_issues": get_project_issues,
    "get_project_documents": get_project_documents,
    "get_project_prediction": get_project_prediction,
    "search_project_documents": search_project_documents,
    "compare_projects": compare_projects,
    "get_projects_by_state": get_projects_by_state,
    "get_projects_by_ministry": get_projects_by_ministry,
    "get_projects_by_sector": get_projects_by_sector,
    "get_high_risk_projects": get_high_risk_projects,
    "get_early_warning_alerts": get_early_warning_alerts,
    "get_audit_log_summary": get_audit_log_summary,
    "calculate_evm_metrics": calculate_evm_metrics
}
