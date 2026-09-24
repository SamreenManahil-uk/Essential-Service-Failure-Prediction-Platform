from pathlib import Path

import joblib
import pandas as pd
import shap


MODEL_PATH = Path("models/failure_prediction_model.joblib")

pipeline = joblib.load(MODEL_PATH)

preprocessor = pipeline.named_steps["preprocessor"]
xgb_model = pipeline.named_steps["model"]

explainer = shap.TreeExplainer(xgb_model)


def explain_prediction(
    machine_type: str,
    air_temperature: float,
    process_temperature: float,
    rotational_speed: float,
    torque: float,
    tool_wear: float,
):
    input_data = pd.DataFrame(
        [
            {
                "Type": machine_type,
                "Air temperature": air_temperature,
                "Process temperature": process_temperature,
                "Rotational speed": rotational_speed,
                "Torque": torque,
                "Tool wear": tool_wear,
            }
        ]
    )

    transformed = preprocessor.transform(input_data)

    feature_names = preprocessor.get_feature_names_out()

    shap_values = explainer.shap_values(transformed)

    values = shap_values[0]

    contributions = []

    for feature, value in zip(feature_names, values):
        contributions.append(
            {
                "feature": str(feature),
                "shap_value": round(float(value), 4),
                "impact": (
                    "increases risk"
                    if value > 0
                    else "decreases risk"
                ),
            }
        )

    contributions.sort(
        key=lambda item: abs(item["shap_value"]),
        reverse=True,
    )

    return contributions[:5]
