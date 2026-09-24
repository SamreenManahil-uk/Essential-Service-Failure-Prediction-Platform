from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    asset_id: int
    machine_type: str = Field(pattern="^[LMH]$")
    air_temperature: float
    process_temperature: float
    rotational_speed: float
    torque: float
    tool_wear: float


class ShapContribution(BaseModel):
    feature: str
    shap_value: float
    impact: str


class PredictionResponse(BaseModel):
    asset_id: int
    predicted_failure: int
    failure_probability: float
    risk_level: str
    prediction_window_hours: int
    model_type: str
    top_contributing_factors: list[ShapContribution]
