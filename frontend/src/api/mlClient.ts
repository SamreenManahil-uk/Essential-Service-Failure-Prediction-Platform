import axios from "axios";

export const mlApi = axios.create({
  baseURL: "http://localhost:8002",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export type MachineType = "L" | "M" | "H";

export interface PredictionRequest {
  asset_id: number;
  machine_type: MachineType;
  air_temperature: number;
  process_temperature: number;
  rotational_speed: number;
  torque: number;
  tool_wear: number;
}

export interface ShapContribution {
  feature: string;
  shap_value: number;
  impact: string;
}

export interface PredictionResponse {
  asset_id: number;
  predicted_failure: number;
  failure_probability: number;
  risk_level: string;
  prediction_window_hours: number;
  model_type: string;
  top_contributing_factors: ShapContribution[];
}

export async function runPrediction(
  payload: PredictionRequest
): Promise<PredictionResponse> {
  const response = await mlApi.post<PredictionResponse>(
    "/predict",
    payload
  );

  return response.data;
}
