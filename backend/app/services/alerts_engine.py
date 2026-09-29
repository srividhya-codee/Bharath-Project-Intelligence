import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from backend.app.db.models import Project, Alert, Milestone, ProgressUpdate, Prediction, Risk
from backend.app.services.metrics import calculate_spi, calculate_financial_physical_gap, calculate_time_overrun_days


def evaluate_and_generate_alerts(db: Session, project: Project) -> List[Alert]:
    """Evaluates rules and ML thresholds for a project and creates early warning alerts."""
    created_alerts = []

    # 1. Fetch latest progress
    latest_update = (
        db.query(ProgressUpdate)
        .filter(ProgressUpdate.project_id == project.id)
        .order_by(ProgressUpdate.period_end.desc())
        .first()
    )
    if not latest_update:
        return created_alerts

    planned_pct = latest_update.planned_physical_pct
    actual_pct = latest_update.actual_physical_pct
    financial_pct = latest_update.financial_progress_pct
    budget_util = round((project.expenditure_cr / project.approved_cost_cr * 100), 1) if project.approved_cost_cr > 0 else 0.0

    spi = calculate_spi(actual_pct, planned_pct)
    fin_gap = calculate_financial_physical_gap(financial_pct, actual_pct)
    time_overrun = calculate_time_overrun_days(project.planned_completion_date, project.expected_completion_date)

    # Latest ML prediction
    prediction = (
        db.query(Prediction)
        .filter(Prediction.project_id == project.id)
        .order_by(Prediction.generated_at.desc())
        .first()
    )
    risk_score = prediction.risk_score if prediction else 25.0
    pred_delay = prediction.predicted_delay_days if prediction else 0
    pred_cost_overrun = prediction.predicted_cost_overrun_pct if prediction else 0.0

    # Open risks for explanation
    open_risks = db.query(Risk).filter(Risk.project_id == project.id, Risk.status == "Open").all()
    risk_categories = [r.category for r in open_risks]

    # Rule checks
    reasons = []
    severity = "Low"

    if risk_score >= 80 or (spi < 0.80 and fin_gap > 20):
        severity = "Critical"
    elif risk_score >= 60 or spi < 0.85 or fin_gap > 15:
        severity = "High"
    elif spi < 0.90 or fin_gap > 10:
        severity = "Medium"

    if spi < 0.85:
        reasons.append(f"Physical progress is {round(planned_pct - actual_pct, 1)} points behind plan (SPI {spi:.2f})")
    if fin_gap > 15.0:
        reasons.append(f"Spending is {fin_gap:.1f} points ahead of physical delivery")
    if pred_delay > 60:
        reasons.append(f"AI models predict an operational schedule delay of {pred_delay} days (~{round(pred_delay/30, 1)} months)")
    if pred_cost_overrun > 10.0:
        reasons.append(f"Forecasted cost overrun of {pred_cost_overrun:.1f}% over approved capital allocation")
    if open_risks:
        reasons.append(f"Identified active hindrances: {', '.join(risk_categories[:3])}")

    # Check milestone slippage
    slipped_milestones = (
        db.query(Milestone)
        .filter(Milestone.project_id == project.id, Milestone.status.in_(["Delayed", "Pending"]))
        .all()
    )
    for m in slipped_milestones:
        m_delay = (m.expected_date - m.planned_date).days
        if m_delay > 30:
            reasons.append(f"Key Milestone '{m.name}' slipped by {m_delay} days")
            break

    # If significant conditions met, generate alert
    if severity in ["High", "Critical"] and reasons:
        # Check if an open alert of this type already exists to prevent duplicate flooding
        existing = (
            db.query(Alert)
            .filter(Alert.project_id == project.id, Alert.status == "Open")
            .first()
        )
        if not existing:
            explanation_text = (
                f"🚨 {severity.upper()} RISK ALERT\n"
                f"Project: {project.project_code} (Synthetic Demonstration Data)\n"
                f"Physical Progress: {actual_pct}% | Planned: {planned_pct}% | Budget Utilization: {budget_util}%\n"
                f"Predicted Delay: {round(pred_delay/30, 1)} months (AI prediction) | Risk Score: {risk_score:.0f}/100\n"
                f"Why this alert fired:\n" +
                "\n".join([f" • {r}" for r in reasons])
            )

            alert = Alert(
                project_id=project.id,
                alert_type="Integrated Risk Alert",
                severity=severity,
                title=f"{severity.upper()} RISK: {project.project_code} ({project.name[:45]}...)",
                explanation=explanation_text,
                evidence={
                    "spi": spi,
                    "financial_gap": fin_gap,
                    "risk_score": risk_score,
                    "predicted_delay_days": pred_delay,
                    "predicted_cost_overrun_pct": pred_cost_overrun,
                    "reasons": reasons,
                    "sources": ["Inspection Reports", "Monthly Review Minutes", "EVM Analytics"]
                },
                status="Open",
                created_at=datetime.datetime.utcnow()
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            created_alerts.append(alert)

    return created_alerts
