import datetime
import pytest
from backend.app.services.metrics import (
    calculate_physical_progress_gap,
    calculate_financial_physical_gap,
    calculate_budget_utilisation_pct,
    calculate_cost_overrun_pct,
    calculate_time_overrun_days,
    calculate_spi,
    calculate_cpi,
    calculate_eac,
    is_project_delayed,
    compute_all_project_metrics,
)


def test_physical_progress_gap():
    # Worked example: planned 80%, actual 62% -> 18 points behind
    assert calculate_physical_progress_gap(80.0, 62.0) == 18.0
    # On track
    assert calculate_physical_progress_gap(50.0, 50.0) == 0.0
    # Ahead of track
    assert calculate_physical_progress_gap(40.0, 45.0) == -5.0


def test_financial_physical_gap():
    # Worked example: financial 84%, actual 62% -> 22 points ahead
    assert calculate_financial_physical_gap(84.0, 62.0) == 22.0
    # Balanced
    assert calculate_financial_physical_gap(50.0, 50.0) == 0.0


def test_budget_utilisation():
    # 840 Cr spent out of 1000 Cr approved -> 84%
    assert calculate_budget_utilisation_pct(840.0, 1000.0) == 84.0
    # Zero approved cost guard
    assert calculate_budget_utilisation_pct(100.0, 0.0) == 0.0


def test_cost_overrun():
    # Approved 1000 Cr, revised to 1250 Cr -> 25% overrun
    assert calculate_cost_overrun_pct(1000.0, 1250.0) == 25.0
    # No revised cost submitted
    assert calculate_cost_overrun_pct(1000.0, None) == 0.0
    # Revised lower than approved
    assert calculate_cost_overrun_pct(1000.0, 950.0) == 0.0


def test_time_overrun_days():
    d1 = datetime.date(2025, 3, 31)
    d2 = datetime.date(2025, 6, 30)  # ~91 days delay
    assert calculate_time_overrun_days(d1, d2) == 91
    # On time or early
    assert calculate_time_overrun_days(d2, d1) == 0


def test_spi_and_cpi():
    # Worked example: P-102 actual 62%, planned 80%
    spi = calculate_spi(62.0, 80.0)
    assert spi == 0.775  # 62 / 80

    # P-102 actual 62%, financial 84%
    cpi = calculate_cpi(62.0, 84.0)
    assert cpi == 0.738  # 62 / 84


def test_eac():
    # Approved 1000 Cr, CPI 0.8 -> EAC 1250 Cr
    assert calculate_eac(1000.0, 0.8) == 1250.0


def test_is_project_delayed():
    planned = datetime.date(2025, 1, 1)
    on_time = datetime.date(2025, 1, 10)
    late = datetime.date(2025, 3, 1)  # > 30 days

    # SPI < 0.9 triggers delay even if date hasn't passed
    assert is_project_delayed(62.0, 80.0, planned, on_time) is True

    # High time overrun triggers delay even if SPI is OK
    assert is_project_delayed(95.0, 95.0, planned, late) is True

    # Healthy project
    assert is_project_delayed(85.0, 85.0, planned, on_time) is False


def test_consolidated_metrics_worked_example_p102():
    # Validating the exact benchmark numbers required for P-102
    metrics = compute_all_project_metrics(
        approved_cost_cr=1250.0,
        revised_cost_cr=1380.0,
        expenditure_cr=1050.0,
        planned_physical_pct=80.0,
        actual_physical_pct=62.0,
        financial_progress_pct=84.0,
        planned_date=datetime.date(2025, 3, 31),
        expected_date=datetime.date(2025, 7, 1)  # 92 days delay (~3 months)
    )

    assert metrics["spi"] == 0.775
    assert metrics["cpi"] == 0.738
    assert metrics["physical_progress_gap"] == 18.0
    assert metrics["financial_physical_gap"] == 22.0
    assert metrics["budget_utilisation_pct"] == 84.0
    assert metrics["time_overrun_days"] == 92
    assert metrics["is_delayed"] is True
    assert metrics["is_prediction"] is False
