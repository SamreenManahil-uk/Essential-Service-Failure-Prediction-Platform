import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_validate,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from xgboost import XGBClassifier


DATA_PATH = Path("data/raw/ai4i2020.csv")
MODEL_DIR = Path("models")
REPORT_DIR = Path("reports")

MODEL_DIR.mkdir(exist_ok=True)
REPORT_DIR.mkdir(exist_ok=True)


FEATURES = [
    "Type",
    "Air temperature",
    "Process temperature",
    "Rotational speed",
    "Torque",
    "Tool wear",
]

TARGET = "Machine failure"

CATEGORICAL_FEATURES = ["Type"]

NUMERIC_FEATURES = [
    "Air temperature",
    "Process temperature",
    "Rotational speed",
    "Torque",
    "Tool wear",
]


def create_preprocessor():
    return ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
                CATEGORICAL_FEATURES,
            ),
            (
                "numeric",
                "passthrough",
                NUMERIC_FEATURES,
            ),
        ]
    )


def evaluate_test_set(name, model, X_test, y_test):
    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": float(
            accuracy_score(y_test, predictions)
        ),
        "precision": float(
            precision_score(
                y_test,
                predictions,
                zero_division=0
            )
        ),
        "recall": float(
            recall_score(
                y_test,
                predictions,
                zero_division=0
            )
        ),
        "f1": float(
            f1_score(
                y_test,
                predictions,
                zero_division=0
            )
        ),
        "roc_auc": float(
            roc_auc_score(y_test, probabilities)
        ),
    }

    print("\n" + "=" * 60)
    print(f"{name} - FINAL TEST SET")
    print("=" * 60)

    for metric, value in metrics.items():
        print(f"{metric:10}: {value:.4f}")

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    return metrics


def run_cross_validation(name, model, X_train, y_train, cv):
    scoring = {
        "accuracy": "accuracy",
        "precision": "precision",
        "recall": "recall",
        "f1": "f1",
        "roc_auc": "roc_auc",
    }

    print("\n" + "=" * 60)
    print(f"{name} - 5 FOLD CROSS VALIDATION")
    print("=" * 60)

    scores = cross_validate(
        model,
        X_train,
        y_train,
        cv=cv,
        scoring=scoring,
        n_jobs=-1,
    )

    summary = {}

    for metric in scoring:
        values = scores[f"test_{metric}"]

        summary[metric] = {
            "mean": float(np.mean(values)),
            "std": float(np.std(values)),
            "folds": [float(v) for v in values],
        }

        print(
            f"{metric:10}: "
            f"{np.mean(values):.4f} "
            f"(+/- {np.std(values):.4f})"
        )

    return summary


def main():
    df = pd.read_csv(DATA_PATH)

    print("=" * 60)
    print("AI4I PREDICTIVE MAINTENANCE")
    print("=" * 60)

    print("\nDataset shape:", df.shape)

    X = df[FEATURES]
    y = df[TARGET]

    print("\nOriginal target distribution:")
    print(y.value_counts())

    # Keep final test set completely untouched.
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print("\nTraining distribution:")
    print(y_train.value_counts())

    print("\nTest distribution:")
    print(y_test.value_counts())

    negative = int((y_train == 0).sum())
    positive = int((y_train == 1).sum())

    scale_pos_weight = negative / positive

    print(
        "\nXGBoost scale_pos_weight:",
        round(scale_pos_weight, 4)
    )

    # RANDOM FOREST
    rf_model = Pipeline(
        steps=[
            (
                "preprocessor",
                create_preprocessor()
            ),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=300,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    # XGBOOST
    xgb_model = Pipeline(
        steps=[
            (
                "preprocessor",
                create_preprocessor()
            ),
            (
                "model",
                XGBClassifier(
                    n_estimators=300,
                    max_depth=5,
                    learning_rate=0.05,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    scale_pos_weight=scale_pos_weight,
                    random_state=42,
                    eval_metric="logloss",
                    n_jobs=-1,
                ),
            ),
        ]
    )

    # Stratified keeps failure ratio similar in every fold.
    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42,
    )

    rf_cv = run_cross_validation(
        "RANDOM FOREST",
        rf_model,
        X_train,
        y_train,
        cv,
    )

    xgb_cv = run_cross_validation(
        "XGBOOST",
        xgb_model,
        X_train,
        y_train,
        cv,
    )

    # Select using mean CV F1.
    if xgb_cv["f1"]["mean"] >= rf_cv["f1"]["mean"]:
        best_model = xgb_model
        best_name = "XGBoost"
        best_cv = xgb_cv
    else:
        best_model = rf_model
        best_name = "RandomForest"
        best_cv = rf_cv

    print("\n" + "=" * 60)
    print("MODEL SELECTED USING 5-FOLD CV F1")
    print("=" * 60)

    print("Best model:", best_name)
    print(
        "CV F1:",
        round(best_cv["f1"]["mean"], 4)
    )

    # Train selected model on complete training set.
    print("\nTraining selected model on full training set...")

    best_model.fit(X_train, y_train)

    # Evaluate only once on untouched test set.
    test_metrics = evaluate_test_set(
        best_name,
        best_model,
        X_test,
        y_test,
    )

    joblib.dump(
        best_model,
        MODEL_DIR / "failure_prediction_model.joblib",
    )

    results = {
        "dataset": "AI4I 2020 Predictive Maintenance",
        "class_handling": {
            "random_forest": "class_weight=balanced",
            "xgboost_scale_pos_weight": scale_pos_weight,
        },
        "cross_validation": {
            "method": "StratifiedKFold",
            "folds": 5,
            "RandomForest": rf_cv,
            "XGBoost": xgb_cv,
        },
        "selected_model": best_name,
        "selection_metric": "mean_cv_f1",
        "final_test_metrics": test_metrics,
    }

    with open(
        REPORT_DIR / "model_metrics.json",
        "w"
    ) as file:
        json.dump(results, file, indent=2)

    metadata = {
        "model": best_name,
        "features": FEATURES,
        "target": TARGET,
        "cross_validation": "5-fold StratifiedKFold",
        "selection_metric": "F1",
    }

    with open(
        MODEL_DIR / "model_metadata.json",
        "w"
    ) as file:
        json.dump(metadata, file, indent=2)

    print("\nModel saved successfully:")
    print(
        MODEL_DIR / "failure_prediction_model.joblib"
    )


if __name__ == "__main__":
    main()
