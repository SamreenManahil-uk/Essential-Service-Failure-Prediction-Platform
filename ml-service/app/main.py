from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.explainer import explain_prediction
from app.predictor import predict_failure
from app.schemas import PredictionRequest, PredictionResponse


app = FastAPI(
    title="Essential Service Failure Prediction ML API",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "failure-prediction-ml",
        "model_loaded": True,
        "explainability": "SHAP",
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    prediction, probability, risk_level = predict_failure(
        data.machine_type,
        data.air_temperature,
        data.process_temperature,
        data.rotational_speed,
        data.torque,
        data.tool_wear,
    )

    shap_factors = explain_prediction(
        data.machine_type,
        data.air_temperature,
        data.process_temperature,
        data.rotational_speed,
        data.torque,
        data.tool_wear,
    )

    return PredictionResponse(
        asset_id=data.asset_id,
        predicted_failure=prediction,
        failure_probability=round(probability, 4),
        risk_level=risk_level,
        prediction_window_hours=24,
        model_type="XGBoost",
        top_contributing_factors=shap_factors,
    )
