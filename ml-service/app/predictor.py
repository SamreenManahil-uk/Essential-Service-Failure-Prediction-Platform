from pathlib import Path
import joblib
import pandas as pd

MODEL_PATH = Path("models/failure_prediction_model.joblib")

model = joblib.load(MODEL_PATH)


def predict_failure(
    machine_type,
    air_temperature,
    process_temperature,
    rotational_speed,
    torque,
    tool_wear,
):
    input_data = pd.DataFrame([{
        "Type": machine_type,
        "Air temperature": air_temperature,
        "Process temperature": process_temperature,
        "Rotational speed": rotational_speed,
        "Torque": torque,
        "Tool wear": tool_wear,
    }])

    probability = float(model.predict_proba(input_data)[0][1])
    prediction = int(model.predict(input_data)[0])

    if probability >= 0.75:
        risk_level = "Critical"
    elif probability >= 0.50:
        risk_level = "High"
    elif probability >= 0.25:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return prediction, probability, risk_level
