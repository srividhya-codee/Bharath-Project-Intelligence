import pytest
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.session import Base
from backend.app.db.models import Project, ProgressUpdate, Milestone, Risk, Sector, State, Ministry, ImplementingAgency
from backend.app.ml.prediction_service import (
    calculate_baseline_risk_score,
    get_risk_band,
    extract_project_features,
    generate_and_save_prediction
)
from backend.app.ml.models import FEATURE_NAMES


def test_baseline_risk_score_calculation():
    # Healthy project
    low_risk = calculate_baseline_risk_score(
        spi=1.0, financial_gap=0.0, time_overrun_days=0, cost_overrun_pct=0.0,
        open_severe_risks_count=0, open_issues_count=0
    )
    assert low_risk <= 20.0
    assert get_risk_band(low_risk) == "Low"

    # Distressed project: SPI 0.775, financial gap 22, severe risks 2
    distressed = calculate_baseline_risk_score(
        spi=0.775, financial_gap=22.0, time_overrun_days=90, cost_overrun_pct=15.0,
        open_severe_risks_count=2, open_issues_count=3
    )
    assert distressed >= 60.0
    assert get_risk_band(distressed) in ["High", "Critical"]


def test_feature_extraction_and_prediction():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    m = Ministry(code="MoRTH", name="Ministry of Road Transport and Highways", short_name="MoRTH")
    st = State(code="TN", name="Tamil Nadu", region="South")
    sec = Sector(name="Roads & Highways")
    agency = ImplementingAgency(name="NHAI", type="NHAI")
    db.add_all([m, st, sec, agency])
    db.flush()

    p = Project(
        project_code="P-102",
        name="Four-Laning Highway Project",
        ministry_id=m.id,
        sector_id=sec.id,
        state_id=st.id,
        implementing_agency_id=agency.id,
        approved_cost_cr=1420.0,
        expenditure_cr=1192.8,  # 84%
        start_date=datetime.date(2022, 1, 1),
        planned_completion_date=datetime.date(2025, 6, 30),
        expected_completion_date=datetime.date(2025, 9, 30),
        status="Active",
        is_synthetic=True
    )
    db.add(p)
    db.flush()

    # Progress: planned 80%, actual 62%, financial 84%
    prog = ProgressUpdate(
        project_id=p.id,
        period_end=datetime.date(2024, 8, 31),
        planned_physical_pct=80.0,
        actual_physical_pct=62.0,
        financial_progress_pct=84.0,
        remarks="Monthly progress update",
        submitted_by="Project Director"
    )
    db.add(prog)

    # Risk: Land acquisition
    risk = Risk(
        project_id=p.id,
        category="Land Acquisition",
        severity="High",
        description="Pending RoW at Ch 42-56 km",
        status="Open"
    )
    db.add(risk)
    db.commit()

    # Feature extraction check
    features, meta = extract_project_features(p)
    assert len(features) == len(FEATURE_NAMES)
    assert meta["planned_physical_pct"] == 80.0
    assert meta["actual_physical_pct"] == 62.0
    assert meta["budget_utilisation_pct"] == 84.0

    # Prediction execution
    pred = generate_and_save_prediction(db, p)
    assert pred.risk_score >= 80.0
    assert pred.risk_band == "Critical"
    assert pred.predicted_delay_days >= 60
    assert len(pred.top_factors) >= 3

    # Check top factor keys
    factor_names = [f["factor"] for f in pred.top_factors]
    assert any("Physical Progress Gap" in name for name in factor_names)
    assert any("Spending Ahead" in name or "Financial" in name for name in factor_names)

    db.close()
