"""Core Metrics and Performance Indicator Formulas for Bharat Project Intelligence.

All mathematical formulas strictly conform to project management standards (Earned Value Management)
and Government project monitoring guidelines.
"""
import datetime
from typing import Optional, Dict, Any


def calculate_physical_progress_gap(planned_pct: float, actual_pct: float) -> float:
    """Physical progress gap = planned_physical_pct − actual_physical_pct.
    Positive value indicates project is lagging behind schedule.
    """
    return round(float(planned_pct) - float(actual_pct), 2)


def calculate_financial_physical_gap(financial_pct: float, actual_physical_pct: float) -> float:
    """Financial-physical gap = financial_progress_pct − actual_physical_pct.
    A large positive value means spending is ahead of physical delivery.
    """
    return round(float(financial_pct) - float(actual_physical_pct), 2)


def calculate_budget_utilisation_pct(expenditure_cr: float, approved_cost_cr: float) -> float:
    """Budget utilisation % = (expenditure / approved_cost) * 100."""
    if approved_cost_cr <= 0:
        return 0.0
    return round((float(expenditure_cr) / float(approved_cost_cr)) * 100.0, 2)


def calculate_cost_overrun_pct(approved_cost_cr: float, revised_cost_cr: Optional[float]) -> float:
    """Cost overrun % = ((revised_cost − approved_cost) / approved_cost) * 100.
    Returns 0.0 if no revised cost is submitted or revised <= approved.
    """
    if approved_cost_cr <= 0 or revised_cost_cr is None:
        return 0.0
    overrun = ((float(revised_cost_cr) - float(approved_cost_cr)) / float(approved_cost_cr)) * 100.0
    return round(max(0.0, overrun), 2)


def calculate_time_overrun_days(planned_date: datetime.date, expected_date: datetime.date) -> int:
    """Time overrun days = expected_completion_date − planned_completion_date.
    Positive value indicates schedule slippage.
    """
    delta = (expected_date - planned_date).days
    return max(0, delta)


def calculate_spi(actual_physical_pct: float, planned_physical_pct: float) -> float:
    """Schedule Performance Index (SPI) = actual_physical_pct / planned_physical_pct.
    SPI >= 1.0 : on or ahead of schedule
    SPI < 1.0  : behind schedule
    """
    if planned_physical_pct <= 0:
        return 1.0 if actual_physical_pct >= 0 else 0.0
    return round(float(actual_physical_pct) / float(planned_physical_pct), 3)


def calculate_cpi(actual_physical_pct: float, financial_progress_pct: float) -> float:
    """Cost Performance Index (CPI) = actual_physical_pct / financial_progress_pct.
    CPI >= 1.0 : cost efficient (getting more physical progress per rupee spent)
    CPI < 1.0  : cost inefficient (spending more than physical progress achieved)
    """
    if financial_progress_pct <= 0:
        return 1.0 if actual_physical_pct >= 0 else 0.0
    return round(float(actual_physical_pct) / float(financial_progress_pct), 3)


def calculate_eac(approved_cost_cr: float, cpi: float) -> float:
    """Estimate at Completion (EAC) = approved_cost / CPI.
    Guards against divide-by-zero or zero/negative CPI by capping at approved_cost or 5x multiplier.
    """
    if approved_cost_cr <= 0:
        return 0.0
    if cpi <= 0.05:  # extreme edge case
        return round(float(approved_cost_cr) * 3.0, 2)
    return round(float(approved_cost_cr) / float(cpi), 2)


def is_project_delayed(
    actual_physical_pct: float,
    planned_physical_pct: float,
    planned_date: datetime.date,
    expected_date: datetime.date
) -> bool:
    """A project is Delayed if SPI < 0.9 OR expected_completion_date > planned_completion_date by > 30 days."""
    spi = calculate_spi(actual_physical_pct, planned_physical_pct)
    time_overrun = calculate_time_overrun_days(planned_date, expected_date)
    return spi < 0.9 or time_overrun > 30


def compute_all_project_metrics(
    approved_cost_cr: float,
    revised_cost_cr: Optional[float],
    expenditure_cr: float,
    planned_physical_pct: float,
    actual_physical_pct: float,
    financial_progress_pct: float,
    planned_date: datetime.date,
    expected_date: datetime.date
) -> Dict[str, Any]:
    """Computes a complete consolidated dictionary of verified project metrics."""
    spi = calculate_spi(actual_physical_pct, planned_physical_pct)
    cpi = calculate_cpi(actual_physical_pct, financial_progress_pct)
    physical_gap = calculate_physical_progress_gap(planned_physical_pct, actual_physical_pct)
    financial_gap = calculate_financial_physical_gap(financial_progress_pct, actual_physical_pct)
    budget_utilisation = calculate_budget_utilisation_pct(expenditure_cr, approved_cost_cr)
    cost_overrun_pct = calculate_cost_overrun_pct(approved_cost_cr, revised_cost_cr)
    time_overrun_days = calculate_time_overrun_days(planned_date, expected_date)
    eac = calculate_eac(approved_cost_cr, cpi)
    delayed = is_project_delayed(actual_physical_pct, planned_physical_pct, planned_date, expected_date)

    return {
        "spi": spi,
        "cpi": cpi,
        "physical_progress_gap": physical_gap,
        "financial_physical_gap": financial_gap,
        "budget_utilisation_pct": budget_utilisation,
        "cost_overrun_pct": cost_overrun_pct,
        "time_overrun_days": time_overrun_days,
        "estimate_at_completion_cr": eac,
        "is_delayed": delayed,
        "as_of": datetime.datetime.utcnow().isoformat(),
        "is_prediction": False
    }
