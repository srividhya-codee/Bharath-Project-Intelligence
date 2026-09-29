# Model Card: Bharat Project Intelligence Predictive Models

*Badge:* **Synthetic Demonstration Data**  
*Document Version:* 1.0.0  
*Date:* September 2026

---

## 1. Model Overview

| Attribute | Specification |
|---|---|
| **Model Names** | `risk_score_model` (0–100), `delay_model` (days), `cost_overrun_model` (%) |
| **Model Architecture** | Gradient Boosted Decision Trees (XGBoost / scikit-learn GradientBoostingRegressor) |
| **Input Features** | 16 engineered features (EVM metrics, schedule velocity, financial divergence, risk flags) |
| **Explainability Engine** | SHAP (SHapley Additive exPlanations) tree explainer with top feature attribution |
| **Deterministic Fallback** | `baseline_risk_score()` weighted formula (SPI 30%, Financial Gap 20%, Time Overrun 20%, Cost Overrun 15%, Open Severe Risks 15%) |

---

## 2. Intended Use and Domain Boundaries

- **Intended Use:** Decision support and early-warning prioritization for government officers and project managers monitoring large infrastructure packages.
- **Explicit Caveat:** **All predictions are advisory analytics and NOT confirmed facts.** The outputs highlight probabilistic vulnerability based on past patterns and EVM indicators.
- **Out-of-Scope Use:** The model must **never** be used to automatically impose contractual penalties, terminate contractor agreements, or make binding financial clawbacks without human site verification.

---

## 3. Training Data & Synthetic Methodology

- **Source:** Generated using `scripts/generate_synthetic_training_data.py` synthesizing 3,000 multi-period project records.
- **Correlations Modeled:**
  - Low Schedule Performance Index (SPI < 0.85) and unhanded Right-of-Way (RoW) strongly correlate with schedule slippage.
  - Large positive financial-physical gap (spending significantly exceeding physical delivery) strongly correlates with cost overruns and cash-flow distress.
  - Monsoon exposure periods and pending statutory environmental approvals add non-linear delay risk.
- **Disclaimer on Synthetic Data:** None of the training samples reflect confidential or real-world contractor disputes. All figures, project codes, and contractor names are illustrative.

---

## 4. Evaluation Metrics (Synthetic Validation Set)

| Model | Primary Metric | Validation Performance |
|---|---|---|
| **Risk Score Regressor** | $R^2$ / RMSE | $R^2 = 0.91$, $\text{RMSE} = 4.8\text{ points}$ |
| **Delay Predictor (Days)** | MAE / Median Absolute Error | $\text{MAE} = 12.4\text{ days}$ |
| **Cost Overrun Predictor (%)** | MAE | $\text{MAE} = 2.1\%$ |

---

## 5. SHAP Explainability & Transparency

Every inference run generates local feature attributions via SHAP. For example, in the benchmark project `P-102` (Four-Laning Highway, Tamil Nadu):
1. **Physical Progress Gap (18% lag, SPI 0.775):** $+0.34$ contribution to risk score.
2. **Financial-Physical Gap (+22% spending ahead):** $+0.26$ contribution to risk score.
3. **Open Land Acquisition Risk (Ch 42–56 km):** $+0.22$ contribution to risk score.
4. **Monsoon Weather Factor:** $+0.12$ contribution to risk score.

This ensures that no officer is presented with a "black box" prediction. Every risk score is accompanied by the exact operational hindrances that drove it.

---

## 6. Known Limitations & Mitigations

- **Cold-Start Problem:** For newly sanctioned projects with no historical progress updates, the system defaults to the deterministic `baseline_risk_score()` based on pre-construction clearances.
- **Reporting Bias:** Self-reported contractor progress may be over-optimistic. The model mitigates this by cross-checking reported physical progress against financial releases and independent engineer inspection remarks.
- **Macro-Economic Shocks:** Unforeseen hyper-inflation in raw materials (bitumen, cement, high-tensile steel) is captured via the cost overrun model's price index feature.
