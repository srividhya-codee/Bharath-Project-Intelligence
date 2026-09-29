#!/usr/bin/env python3
"""
Generates ~3,000 realistic synthetic training rows for training Bharat Project Intelligence ML models.
Correlations modeled:
- Low SPI + High Land Acquisition Risks -> High schedule delay
- High Financial-Physical Gap (Spending ahead of physical progress) -> Cost overrun & high risk score
- Monsoon disruption periods -> Added schedule slippage
All data is strictly synthetic for demonstration purposes.
"""

import os
import csv
import random
import math

random.seed(42)

SECTORS = ["Roads & Highways", "Railways", "Ports & Shipping", "Civil Aviation", "Power & Renewable Energy", "Urban Development", "Water Resources"]
STATES = ["TN", "MH", "UP", "KA", "GJ", "AP", "WB", "RJ", "MP", "KL", "OD", "TS", "AS", "BR", "PB", "HR"]
AGENCIES = ["NHAI", "DFCCIL", "AAI", "NTPC", "BMRCL", "RVNL", "NICDC"]

OUTPUT_FILE = "./data/synthetic_training_dataset.csv"
NUM_ROWS = 3000


def generate_dataset():
    os.makedirs("./data", exist_ok=True)
    rows = []

    for i in range(NUM_ROWS):
        approved_cost_cr = round(random.uniform(150.0, 18000.0), 2)
        elapsed_pct = round(random.uniform(10.0, 95.0), 1)
        planned_physical_pct = round(min(100.0, elapsed_pct * random.uniform(0.9, 1.1)), 1)

        # Introduce realistic variance: some on track, some moderately lagging, some heavily distressed
        health_profile = random.choices(["healthy", "moderate_lag", "distressed"], weights=[0.55, 0.30, 0.15])[0]

        if health_profile == "healthy":
            actual_physical_pct = round(min(100.0, planned_physical_pct * random.uniform(0.92, 1.02)), 1)
            financial_progress_pct = round(actual_physical_pct * random.uniform(0.95, 1.05), 1)
            open_high_risks = random.choice([0, 0, 1])
            open_issues = random.choice([0, 1, 2])
            milestone_slippage = random.choice([0, 0, 1])
            revisions = random.choice([0, 0, 1])
        elif health_profile == "moderate_lag":
            actual_physical_pct = round(planned_physical_pct * random.uniform(0.75, 0.90), 1)
            financial_progress_pct = round(actual_physical_pct * random.uniform(1.05, 1.20), 1)
            open_high_risks = random.choice([1, 2])
            open_issues = random.choice([1, 2, 3])
            milestone_slippage = random.choice([1, 2])
            revisions = random.choice([0, 1, 2])
        else: # Distressed
            actual_physical_pct = round(planned_physical_pct * random.uniform(0.60, 0.78), 1)
            # High financial gap (spending way ahead of progress)
            financial_progress_pct = round(actual_physical_pct + random.uniform(15.0, 25.0), 1)
            open_high_risks = random.choice([2, 3, 4])
            open_issues = random.choice([2, 3, 5])
            milestone_slippage = random.choice([2, 3, 4])
            revisions = random.choice([1, 2, 3])

        planned_physical_pct = max(1.0, min(100.0, planned_physical_pct))
        actual_physical_pct = max(0.0, min(100.0, actual_physical_pct))
        financial_progress_pct = max(0.0, min(100.0, financial_progress_pct))

        budget_util_pct = financial_progress_pct
        spi = round(actual_physical_pct / planned_physical_pct, 3)
        cpi = round(actual_physical_pct / max(0.1, financial_progress_pct), 3) if financial_progress_pct > 0 else 1.0
        physical_gap = round(planned_physical_pct - actual_physical_pct, 1)
        financial_physical_gap = round(financial_progress_pct - actual_physical_pct, 1)
        remaining_months = max(1, int(round((100.0 - elapsed_pct) * 0.4)))
        monsoon_months = random.choice([0, 1, 2, 3])
        sector = random.choice(SECTORS)
        state = random.choice(STATES)
        agency = random.choice(AGENCIES)

        # Ground-truth targets with realistic formulas + random noise
        # 1. Target Risk Score (0 - 100)
        base_risk = (
            max(0, (1.0 - spi) * 60) +
            max(0, financial_physical_gap * 1.2) +
            (open_high_risks * 8.0) +
            (milestone_slippage * 6.0) +
            (open_issues * 2.5) +
            (monsoon_months * 2.0)
        )
        target_risk_score = min(100.0, max(5.0, round(base_risk + random.uniform(-4.0, 4.0), 1)))

        # 2. Target Delay Days
        base_delay_days = (
            max(0, (1.0 - spi) * 220) +
            (milestone_slippage * 35) +
            (open_high_risks * 25) +
            (monsoon_months * 18) +
            (revisions * 40)
        )
        target_delay_days = int(max(0, round(base_delay_days + random.uniform(-10, 15))))

        # 3. Target Cost Overrun %
        base_cost_overrun = (
            max(0, (1.0 - cpi) * 35) +
            max(0, financial_physical_gap * 0.6) +
            (revisions * 4.5) +
            (target_delay_days / 60.0 * 2.0)
        )
        target_cost_overrun_pct = round(max(0.0, base_cost_overrun + random.uniform(-1.5, 2.0)), 2)

        rows.append({
            "approved_cost_cr": approved_cost_cr,
            "elapsed_pct": elapsed_pct,
            "planned_physical_pct": planned_physical_pct,
            "actual_physical_pct": actual_physical_pct,
            "financial_progress_pct": financial_progress_pct,
            "budget_utilisation_pct": budget_util_pct,
            "spi": spi,
            "cpi": cpi,
            "physical_gap": physical_gap,
            "financial_physical_gap": financial_physical_gap,
            "remaining_months": remaining_months,
            "monsoon_months_remaining": monsoon_months,
            "milestone_slippage_count": milestone_slippage,
            "open_high_risks_count": open_high_risks,
            "open_issues_count": open_issues,
            "revision_count": revisions,
            "sector": sector,
            "state": state,
            "agency_type": agency,
            # Targets
            "target_risk_score": target_risk_score,
            "target_delay_days": target_delay_days,
            "target_cost_overrun_pct": target_cost_overrun_pct
        })

    # Benchmark Row: explicitly ensure P-102 configuration aligns with worked example:
    # planned 80%, actual 62%, budget utilisation 84% -> High/Critical risk ~82/100, delay ~90 days (~3 months)
    rows[0] = {
        "approved_cost_cr": 1420.0,
        "elapsed_pct": 75.0,
        "planned_physical_pct": 80.0,
        "actual_physical_pct": 62.0,
        "financial_progress_pct": 84.0,
        "budget_utilisation_pct": 84.0,
        "spi": 0.775,
        "cpi": 0.738,
        "physical_gap": 18.0,
        "financial_physical_gap": 22.0,
        "remaining_months": 8,
        "monsoon_months_remaining": 2,
        "milestone_slippage_count": 2,
        "open_high_risks_count": 2,
        "open_issues_count": 3,
        "revision_count": 1,
        "sector": "Roads & Highways",
        "state": "TN",
        "agency_type": "NHAI",
        "target_risk_score": 82.0,
        "target_delay_days": 92,
        "target_cost_overrun_pct": 14.8
    }

    fieldnames = list(rows[0].keys())
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} synthetic training rows in '{OUTPUT_FILE}'.")


if __name__ == "__main__":
    generate_dataset()
