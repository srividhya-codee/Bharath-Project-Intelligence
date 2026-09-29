from typing import List, Dict, Any
import numpy as np


def compute_top_factors(
    feature_names: List[str],
    feature_values: np.ndarray,
    baseline_values: np.ndarray,
    feature_importances: np.ndarray,
    model=None
) -> List[Dict[str, Any]]:
    """
    Computes top contributing factors for an ML prediction.
    Uses SHAP tree explainer if available and model is passed;
    otherwise computes local feature deviation weighted by model feature importance.
    """
    factors = []

    # Human-friendly descriptions for feature names
    feature_display_map = {
        "physical_gap": ("Physical Progress Gap", "Gap between planned and actual physical delivery"),
        "financial_physical_gap": ("Financial-Physical Divergence", "Spending exceeding physical completion"),
        "spi": ("Schedule Performance Index (SPI)", "Rate of milestone delivery vs baseline"),
        "cpi": ("Cost Performance Index (CPI)", "Value of work performed per rupee expended"),
        "open_high_risks_count": ("Unmitigated High-Severity Risks", "Active site hindrances, RoW or environmental clearances"),
        "milestone_slippage_count": ("Critical Milestone Delays", "Slippage in critical path milestone deadlines"),
        "monsoon_months_remaining": ("Monsoon Weather Window", "Upcoming severe precipitation exposure"),
        "open_issues_count": ("Unresolved Operational Issues", "Pending technical, billing, or site bottlenecks"),
        "revision_count": ("Scope & Cost Revisions", "Prior baseline revisions and scope changes"),
        "budget_utilisation_pct": ("Budget Utilisation", "Proportion of approved financial allocation utilized")
    }

    try:
        if model is not None:
            import shap
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(feature_values.reshape(1, -1))
            vals = shap_values[0] if isinstance(shap_values, list) else shap_values.flatten()

            indexed = sorted(enumerate(vals), key=lambda x: abs(x[1]), reverse=True)
            for idx, val in indexed[:4]:
                fname = feature_names[idx]
                disp_title, disp_desc = feature_display_map.get(fname, (fname.replace("_", " ").title(), fname))
                direction = "increases_risk" if val > 0 else "reduces_risk"
                factors.append({
                    "factor": disp_title,
                    "direction": direction,
                    "contribution": round(float(abs(val)), 3),
                    "description": f"{disp_desc} (Impact: {direction.replace('_', ' ')})"
                })
            return factors
    except Exception:
        # Fallback to feature importance * normalized deviation
        pass

    # Normalized deviation fallback
    deviations = np.abs(feature_values - baseline_values)
    scores = deviations * feature_importances

    top_indices = np.argsort(scores)[::-1][:4]
    for idx in top_indices:
        fname = feature_names[idx]
        disp_title, disp_desc = feature_display_map.get(fname, (fname.replace("_", " ").title(), fname))
        val = feature_values[idx]
        is_adverse = (
            (fname in ["physical_gap", "financial_physical_gap", "open_high_risks_count", "milestone_slippage_count"] and val > 0)
            or (fname in ["spi", "cpi"] and val < 0.95)
        )
        direction = "increases_risk" if is_adverse else "reduces_risk"

        factors.append({
            "factor": disp_title,
            "direction": direction,
            "contribution": round(float(scores[idx]), 3),
            "description": f"{disp_desc} (Current value: {val})"
        })

    return factors
