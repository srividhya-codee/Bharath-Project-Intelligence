#!/usr/bin/env python3
"""
Model Training Script for Bharat Project Intelligence.
Trains GradientBoosted / XGBoost models on synthetic data and persists them to backend/app/ml/saved_models/
Generates model_registry.json.
"""

import os
import csv
import json
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from backend.app.ml.models import FEATURE_NAMES, MODEL_DIR, REGISTRY_PATH
from scripts.generate_synthetic_training_data import generate_dataset, OUTPUT_FILE


def main():
    print("=== Bharat Project Intelligence: Model Training Pipeline ===")
    os.makedirs(MODEL_DIR, exist_ok=True)

    if not os.path.exists(OUTPUT_FILE):
        print(f"Generating synthetic training dataset at {OUTPUT_FILE}...")
        generate_dataset()

    X, y_risk, y_delay, y_cost = [], [], [], []
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            X.append([float(row[k]) for k in FEATURE_NAMES])
            y_risk.append(float(row["target_risk_score"]))
            y_delay.append(float(row["target_delay_days"]))
            y_cost.append(float(row["target_cost_overrun_pct"]))

    X = np.array(X)
    y_risk = np.array(y_risk)
    y_delay = np.array(y_delay)
    y_cost = np.array(y_cost)

    print(f"Loaded {len(X)} training samples with {len(FEATURE_NAMES)} features.")

    # Split
    X_train, X_test, y_r_train, y_r_test = train_test_split(X, y_risk, test_size=0.2, random_state=42)
    _, _, y_d_train, y_d_test = train_test_split(X, y_delay, test_size=0.2, random_state=42)
    _, _, y_c_train, y_c_test = train_test_split(X, y_cost, test_size=0.2, random_state=42)

    # 1. Train Risk Score Regressor
    print("Training Risk Score Regressor...")
    risk_model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42)
    risk_model.fit(X_train, y_r_train)
    r_preds = risk_model.predict(X_test)
    r_r2 = float(r2_score(y_r_test, r_preds))
    r_rmse = float(np.sqrt(mean_squared_error(y_r_test, r_preds)))
    print(f"  Risk Model -> R2: {r_r2:.3f}, RMSE: {r_rmse:.2f}")

    # 2. Train Delay Days Predictor
    print("Training Schedule Delay Predictor...")
    delay_model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42)
    delay_model.fit(X_train, y_d_train)
    d_preds = delay_model.predict(X_test)
    d_mae = float(mean_absolute_error(y_d_test, d_preds))
    print(f"  Delay Model -> MAE: {d_mae:.1f} days")

    # 3. Train Cost Overrun Predictor
    print("Training Cost Overrun % Predictor...")
    cost_model = GradientBoostingRegressor(n_estimators=80, max_depth=4, learning_rate=0.08, random_state=42)
    cost_model.fit(X_train, y_c_train)
    c_preds = cost_model.predict(X_test)
    c_mae = float(mean_absolute_error(y_c_test, c_preds))
    print(f"  Cost Overrun Model -> MAE: {c_mae:.2f}%")

    # Serialize artifacts
    risk_path = os.path.join(MODEL_DIR, "risk_score_model.joblib")
    delay_path = os.path.join(MODEL_DIR, "delay_model.joblib")
    cost_path = os.path.join(MODEL_DIR, "cost_overrun_model.joblib")

    joblib.dump(risk_model, risk_path)
    joblib.dump(delay_model, delay_path)
    joblib.dump(cost_model, cost_path)

    registry = {
        "model_version": "1.0.0",
        "trained_date": "2026-09-24",
        "algorithm": "GradientBoostingRegressor (scikit-learn)",
        "features": FEATURE_NAMES,
        "sample_count": len(X),
        "evaluation_metrics": {
            "risk_score_r2": round(r_r2, 3),
            "risk_score_rmse": round(r_rmse, 2),
            "delay_mae_days": round(d_mae, 1),
            "cost_overrun_mae_pct": round(c_mae, 2)
        },
        "artifacts": {
            "risk_model": "risk_score_model.joblib",
            "delay_model": "delay_model.joblib",
            "cost_model": "cost_overrun_model.joblib"
        },
        "disclaimer": "Synthetic demonstration models trained on illustrative infrastructure data."
    }

    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)

    print(f"Artifacts successfully saved to {MODEL_DIR}")
    print(f"Registry created at {REGISTRY_PATH}")


if __name__ == "__main__":
    main()
