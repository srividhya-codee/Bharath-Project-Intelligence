from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.db.session import get_db
from backend.app.db.models import Project, State, Ministry, Sector, User
from backend.app.api.v1.auth import get_current_user
from backend.app.services.project_service import apply_rbac_scope, format_project_summary

router = APIRouter(prefix="/analytics", tags=["Executive Analytics & Distribution"])


@router.get("/summary")
def get_executive_summary(
    ministry: Optional[str] = None,
    state: Optional[str] = None,
    sector: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    query = apply_rbac_scope(query, current_user)

    if ministry:
        query = query.join(Project.ministry).filter(Ministry.code == ministry)
    if state:
        query = query.join(Project.state).filter(State.name == state)
    if sector:
        query = query.join(Project.sector).filter(Sector.name == sector)

    projects = query.all()
    summaries = [format_project_summary(p) for p in projects]

    total_count = len(summaries)
    if total_count == 0:
        return {
            "total_projects": 0, "active_projects": 0, "completed_projects": 0,
            "delayed_projects": 0, "high_risk_projects": 0, "cost_overrun_projects": 0,
            "total_approved_budget_cr": 0.0, "total_expenditure_cr": 0.0,
            "overall_physical_progress_pct": 0.0, "overall_spi": 1.0, "overall_cpi": 1.0
        }

    active_count = sum(1 for p in summaries if p["status"] == "Active")
    completed_count = sum(1 for p in summaries if p["status"] == "Completed")
    delayed_count = sum(1 for p in summaries if p["is_delayed"])
    high_risk_count = sum(1 for p in summaries if p["risk_band"] in ["High", "Critical"])
    cost_overrun_count = sum(1 for p in summaries if p["cost_overrun_pct"] > 5.0)

    total_budget = sum(p["approved_cost_cr"] for p in summaries)
    total_expenditure = sum(p["expenditure_cr"] for p in summaries)
    avg_physical_pct = sum(p["actual_physical_pct"] for p in summaries) / total_count
    avg_spi = sum(p["spi"] for p in summaries) / total_count
    avg_cpi = sum(p["cpi"] for p in summaries) / total_count

    return {
        "total_projects": total_count,
        "active_projects": active_count,
        "completed_projects": completed_count,
        "delayed_projects": delayed_count,
        "high_risk_projects": high_risk_count,
        "cost_overrun_projects": cost_overrun_count,
        "total_approved_budget_cr": round(total_budget, 2),
        "total_expenditure_cr": round(total_expenditure, 2),
        "budget_utilisation_pct": round((total_expenditure / max(1.0, total_budget)) * 100, 2),
        "overall_physical_progress_pct": round(avg_physical_pct, 1),
        "overall_spi": round(avg_spi, 3),
        "overall_cpi": round(avg_cpi, 3)
    }


@router.get("/by-state")
def get_analytics_by_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    query = apply_rbac_scope(query, current_user)
    projects = query.all()
    summaries = [format_project_summary(p) for p in projects]

    state_data: Dict[str, Dict[str, Any]] = {}
    for p in summaries:
        s_name = p["state_name"] or "Unknown"
        if s_name not in state_data:
            state_data[s_name] = {
                "state_name": s_name,
                "state_code": p["state_code"],
                "project_count": 0,
                "total_budget_cr": 0.0,
                "total_expenditure_cr": 0.0,
                "delayed_count": 0,
                "critical_risk_count": 0,
                "physical_pct_sum": 0.0
            }
        item = state_data[s_name]
        item["project_count"] += 1
        item["total_budget_cr"] += p["approved_cost_cr"]
        item["total_expenditure_cr"] += p["expenditure_cr"]
        item["physical_pct_sum"] += p["actual_physical_pct"]
        if p["is_delayed"]:
            item["delayed_count"] += 1
        if p["risk_band"] in ["High", "Critical"]:
            item["critical_risk_count"] += 1

    result = []
    for s_name, data in state_data.items():
        count = data["project_count"]
        result.append({
            "state_name": s_name,
            "state_code": data["state_code"],
            "project_count": count,
            "total_budget_cr": round(data["total_budget_cr"], 2),
            "total_expenditure_cr": round(data["total_expenditure_cr"], 2),
            "delayed_count": data["delayed_count"],
            "critical_risk_count": data["critical_risk_count"],
            "avg_physical_pct": round(data["physical_pct_sum"] / max(1, count), 1)
        })

    return sorted(result, key=lambda x: x["project_count"], reverse=True)


@router.get("/by-ministry")
def get_analytics_by_ministry(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    query = apply_rbac_scope(query, current_user)
    summaries = [format_project_summary(p) for p in query.all()]

    ministry_data: Dict[str, Dict[str, Any]] = {}
    for p in summaries:
        m_code = p["ministry_code"] or "Other"
        if m_code not in ministry_data:
            ministry_data[m_code] = {
                "ministry_code": m_code,
                "ministry_name": p["ministry_name"] or m_code,
                "project_count": 0,
                "total_budget_cr": 0.0,
                "total_expenditure_cr": 0.0,
                "delayed_count": 0,
                "avg_spi": 0.0,
                "spi_sum": 0.0
            }
        item = ministry_data[m_code]
        item["project_count"] += 1
        item["total_budget_cr"] += p["approved_cost_cr"]
        item["total_expenditure_cr"] += p["expenditure_cr"]
        item["spi_sum"] += p["spi"]
        if p["is_delayed"]:
            item["delayed_count"] += 1

    return [
        {
            "ministry_code": k,
            "ministry_name": v["ministry_name"],
            "project_count": v["project_count"],
            "total_budget_cr": round(v["total_budget_cr"], 2),
            "total_expenditure_cr": round(v["total_expenditure_cr"], 2),
            "delayed_count": v["delayed_count"],
            "avg_spi": round(v["spi_sum"] / max(1, v["project_count"]), 3)
        }
        for k, v in sorted(ministry_data.items(), key=lambda x: x[1]["delayed_count"], reverse=True)
    ]


@router.get("/by-sector")
def get_analytics_by_sector(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    query = apply_rbac_scope(query, current_user)
    summaries = [format_project_summary(p) for p in query.all()]

    sector_data: Dict[str, Dict[str, Any]] = {}
    for p in summaries:
        sec = p["sector_name"] or "Other"
        if sec not in sector_data:
            sector_data[sec] = {
                "sector_name": sec,
                "project_count": 0,
                "total_budget_cr": 0.0,
                "total_expenditure_cr": 0.0,
                "delayed_count": 0,
                "avg_cost_overrun_pct": 0.0,
                "cost_overrun_sum": 0.0
            }
        item = sector_data[sec]
        item["project_count"] += 1
        item["total_budget_cr"] += p["approved_cost_cr"]
        item["total_expenditure_cr"] += p["expenditure_cr"]
        item["cost_overrun_sum"] += p["cost_overrun_pct"]
        if p["is_delayed"]:
            item["delayed_count"] += 1

    return [
        {
            "sector_name": k,
            "project_count": v["project_count"],
            "total_budget_cr": round(v["total_budget_cr"], 2),
            "total_expenditure_cr": round(v["total_expenditure_cr"], 2),
            "delayed_count": v["delayed_count"],
            "avg_cost_overrun_pct": round(v["cost_overrun_sum"] / max(1, v["project_count"]), 2)
        }
        for k, v in sorted(sector_data.items(), key=lambda x: x[1]["project_count"], reverse=True)
    ]


@router.get("/risk-heatmap")
def get_risk_heatmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    query = apply_rbac_scope(query, current_user)
    summaries = [format_project_summary(p) for p in query.all()]

    matrix: Dict[str, Dict[str, int]] = {}
    for p in summaries:
        st = p["state_name"] or "Unknown"
        sec = p["sector_name"] or "General"
        if st not in matrix:
            matrix[st] = {}
        if sec not in matrix[st]:
            matrix[st][sec] = 0
        if p["risk_band"] in ["High", "Critical"]:
            matrix[st][sec] += 1

    heatmap = []
    for state_name, sec_dict in matrix.items():
        for sector_name, risk_count in sec_dict.items():
            if risk_count > 0:
                heatmap.append({
                    "state": state_name,
                    "sector": sector_name,
                    "high_risk_projects": risk_count
                })

    return sorted(heatmap, key=lambda x: x["high_risk_projects"], reverse=True)


@router.get("/benchmarks")
def get_benchmarks(
    sector: str,
    state: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Peer comparison within sector and state."""
    query = db.query(Project).join(Project.sector).filter(Sector.name.ilike(f"%{sector}%"))
    if state:
        query = query.join(Project.state).filter(State.name.ilike(f"%{state}%"))

    projects = query.all()
    summaries = [format_project_summary(p) for p in projects]

    if not summaries:
        return {"sector": sector, "count": 0, "avg_spi": 1.0, "avg_cpi": 1.0, "peer_projects": []}

    avg_spi = sum(p["spi"] for p in summaries) / len(summaries)
    avg_cpi = sum(p["cpi"] for p in summaries) / len(summaries)
    avg_cost_overrun = sum(p["cost_overrun_pct"] for p in summaries) / len(summaries)

    return {
        "sector": sector,
        "sample_size": len(summaries),
        "peer_avg_spi": round(avg_spi, 3),
        "peer_avg_cpi": round(avg_cpi, 3),
        "peer_avg_cost_overrun_pct": round(avg_cost_overrun, 2),
        "peer_projects": sorted(summaries, key=lambda x: x["spi"], reverse=True)[:10]
    }
