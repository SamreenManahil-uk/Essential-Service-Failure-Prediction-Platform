import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Gauge,
  Info,
  LoaderCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Thermometer,
  TriangleAlert,
  Wrench,
  Zap,
} from "lucide-react";

import TopNav from "../components/TopNav";
import { useTheme } from "../theme/ThemeContext";

import {
  runPrediction,
  type MachineType,
  type PredictionResponse,
} from "../api/mlClient";

type FormState = {
  assetId: number;
  machineType: MachineType;
  airTemperature: string;
  processTemperature: string;
  rotationalSpeed: string;
  torque: string;
  toolWear: string;
};

const initialForm: FormState = {
  assetId: 1,
  machineType: "H",
  airTemperature: "305.0",
  processTemperature: "315.0",
  rotationalSpeed: "1200",
  torque: "75",
  toolWear: "230",
};

export default function IntelligencePage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [form, setForm] = useState<FormState>(initialForm);

  const [result, setResult] =
    useState<PredictionResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof FormState,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function analyse() {
    try {
      setLoading(true);
      setError("");

      const response = await runPrediction({
        asset_id: form.assetId,
        machine_type: form.machineType,
        air_temperature: Number(form.airTemperature),
        process_temperature: Number(
          form.processTemperature
        ),
        rotational_speed: Number(
          form.rotationalSpeed
        ),
        torque: Number(form.torque),
        tool_wear: Number(form.toolWear),
      });

      setResult(response);
    } catch (err) {
      console.error(err);

      setError(
        "Prediction service could not be reached. Make sure FastAPI is running on port 8002."
      );
    } finally {
      setLoading(false);
    }
  }

  const probability = result
    ? result.failure_probability * 100
    : null;

  const risk = result?.risk_level ?? "Awaiting analysis";

  const factors = useMemo(() => {
    if (!result) return [];

    const max = Math.max(
      ...result.top_contributing_factors.map((item) =>
        Math.abs(item.shap_value)
      ),
      1
    );

    return result.top_contributing_factors.map((item) => ({
      ...item,
      strength:
        (Math.abs(item.shap_value) / max) * 100,
    }));
  }, [result]);

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-[#050b16] text-white"
          : "bg-[#f5f8fc] text-[#0b1838]"
      }`}
    >
      <TopNav />

      <section className="mx-auto max-w-[1440px] px-5 pb-8 pt-10 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-blue-400">
              <BrainCircuit size={14} />
              Live predictive workspace
            </div>

            <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">
              Failure Intelligence
            </h1>

            <p className={`mt-3 max-w-2xl text-[13px] leading-6 ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}>
              Send machine telemetry to the trained prediction
              service and inspect the resulting failure risk and
              SHAP explanation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[.12em]">
            <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-blue-300">
              FastAPI :8002
            </span>

            <span className={`rounded-full border px-3 py-2 ${
                dark
                  ? "border-white/10 text-slate-400"
                  : "border-slate-200 bg-white text-slate-500"
              }`}>
              XGBoost
            </span>

            <span className={`rounded-full border px-3 py-2 ${
                dark
                  ? "border-white/10 text-slate-400"
                  : "border-slate-200 bg-white text-slate-500"
              }`}>
              SHAP
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="mx-auto max-w-[1440px] px-5 pb-5 sm:px-8 lg:px-12">
          <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-300">
            <TriangleAlert
              size={16}
              className="mt-0.5 shrink-0"
            />

            <p className="text-[11px] leading-5">
              {error}
            </p>
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-[1440px] gap-5 px-5 pb-8 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:px-12">

        {/* INPUT WORKBENCH */}
        <aside
          className={`rounded-[32px] border p-6 sm:p-8 ${
            dark
              ? "border-slate-800 bg-[#0b1424] text-white"
              : "border-slate-200 bg-white text-[#0b1838] shadow-[0_20px_60px_rgba(20,45,90,.06)]"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#1358e8]">
                Machine telemetry
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-.035em]">
                Prediction Input
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Asset #{form.assetId}
              </p>
            </div>

            <div className={`grid h-11 w-11 place-items-center rounded-full text-[#1358e8] ${
                dark ? "bg-blue-500/10" : "bg-blue-50"
              }`}>
              <Cpu size={18} />
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <InputMetric
              icon={Thermometer}
              label="Air temperature"
              value={form.airTemperature}
              unit="K"
              onChange={(value) =>
                updateField(
                  "airTemperature",
                  value
                )
              }
            />

            <InputMetric
              icon={Thermometer}
              label="Process temperature"
              value={form.processTemperature}
              unit="K"
              onChange={(value) =>
                updateField(
                  "processTemperature",
                  value
                )
              }
            />

            <InputMetric
              icon={Activity}
              label="Rotational speed"
              value={form.rotationalSpeed}
              unit="rpm"
              onChange={(value) =>
                updateField(
                  "rotationalSpeed",
                  value
                )
              }
            />

            <InputMetric
              icon={Gauge}
              label="Torque"
              value={form.torque}
              unit="Nm"
              onChange={(value) =>
                updateField("torque", value)
              }
            />

            <InputMetric
              icon={Wrench}
              label="Tool wear"
              value={form.toolWear}
              unit="min"
              onChange={(value) =>
                updateField("toolWear", value)
              }
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-slate-400">
              Machine Type
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(["L", "M", "H"] as MachineType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() =>
                      updateField(
                        "machineType",
                        type
                      )
                    }
                    className={`rounded-xl py-3 text-[11px] font-black transition ${
                      form.machineType === type
                        ? "bg-[#1358e8] text-white"
                        : dark
                          ? "bg-slate-900 text-slate-400 hover:bg-slate-800"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            onClick={analyse}
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#1358e8] py-4 text-[12px] font-black text-white transition hover:bg-[#0d49c7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
                Running XGBoost...
              </>
            ) : (
              <>
                <BrainCircuit size={15} />
                Run AI Analysis
              </>
            )}
          </button>

          <div
            className={`mt-5 flex items-start gap-2 rounded-2xl p-4 ${
              dark ? "bg-slate-900/80" : "bg-slate-50"
            }`}
          >
            <Info
              size={14}
              className="mt-0.5 shrink-0 text-[#1358e8]"
            />

            <p className="text-[9px] leading-4 text-slate-400">
              These values are sent to the live FastAPI
              prediction endpoint. The displayed result is
              returned by the trained ML pipeline.
            </p>
          </div>
        </aside>

        {/* RESULT */}
        <section
          className={`relative min-h-[620px] overflow-hidden rounded-[32px] border p-6 text-white sm:p-8 lg:p-10 ${
            dark
              ? "border-blue-500/20 bg-gradient-to-br from-[#0d47b8] via-[#0b3a91] to-[#071a3d]"
              : "border-transparent bg-[#1358e8]"
          }`}
        >
          <div
            className="absolute inset-0 opacity-[.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "38px 38px",
            }}
          />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-blue-200">
                  Live inference
                </p>

                <p className="mt-2 text-[12px] text-blue-100">
                  {result
                    ? `${result.model_type} response received`
                    : "Ready for prediction"}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[9px] font-bold">
                <Radio size={11} />
                ML SERVICE
              </div>
            </div>

            {!result ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="max-w-md text-center">
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/20 bg-white/10">
                    <BrainCircuit
                      size={35}
                      className="text-blue-100"
                    />
                  </div>

                  <h2 className="mt-7 text-3xl font-black">
                    Ready to analyse.
                  </h2>

                  <p className="mx-auto mt-3 max-w-sm text-[12px] leading-6 text-blue-100">
                    Adjust machine telemetry and run the
                    trained model to generate a failure
                    prediction.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-12 grid items-center gap-10 md:grid-cols-[1fr_.7fr]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-blue-200">
                      Failure probability
                    </p>

                    <motion.p
                      key={probability}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-3 text-[70px] font-black leading-none tracking-[-.07em] sm:text-[90px]"
                    >
                      {probability?.toFixed(2)}
                      <span className="text-[32px] text-blue-200">
                        %
                      </span>
                    </motion.p>

                    <div
                      className={`mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[.14em] ${riskStyle(
                        risk
                      )}`}
                    >
                      <Zap size={13} />
                      {risk}
                    </div>

                    <p className="mt-6 max-w-md text-[12px] leading-6 text-blue-100">
                      Prediction class:{" "}
                      <strong className="text-white">
                        {result.predicted_failure === 1
                          ? "Failure"
                          : "No failure"}
                      </strong>
                      . Model inference window:{" "}
                      <strong className="text-white">
                        {
                          result.prediction_window_hours
                        }{" "}
                        hours
                      </strong>
                      .
                    </p>
                  </div>

                  <div className="mx-auto">
                    <div className="relative grid h-[210px] w-[210px] place-items-center rounded-full border border-white/20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 14,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-4 rounded-full border border-dashed border-white/30"
                      />

                      <div className="grid h-[115px] w-[115px] place-items-center rounded-full bg-white text-[#1358e8] shadow-2xl">
                        <div className="text-center">
                          <BrainCircuit
                            size={26}
                            className="mx-auto"
                          />

                          <p className="mt-2 text-[8px] font-black uppercase tracking-[.12em]">
                            {result.model_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid gap-3 pt-10 sm:grid-cols-3">
                  <MiniResult
                    icon={BrainCircuit}
                    label="Model"
                    value={result.model_type}
                  />

                  <MiniResult
                    icon={ShieldCheck}
                    label="Classification"
                    value={
                      result.predicted_failure === 1
                        ? "Failure"
                        : "Normal"
                    }
                  />

                  <MiniResult
                    icon={CheckCircle2}
                    label="Window"
                    value={`${result.prediction_window_hours}h`}
                  />
                </div>
              </>
            )}
          </div>
        </section>
      </section>

      {/* DYNAMIC SHAP */}
      <section
        className={`py-16 transition-colors duration-300 ${
          dark
            ? "border-t border-slate-800 bg-[#07101f] text-white"
            : "bg-[#f7f9fc] text-[#0b1838]"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]">

            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#1358e8]">
                <Sparkles size={14} />
                Explainable AI
              </div>

              <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-.045em]">
                Why this
                <span className="block text-[#1358e8]">
                  prediction?
                </span>
              </h2>

              <p className={`mt-5 max-w-md text-[13px] leading-6 ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}>
                SHAP identifies which transformed model
                features pushed this individual prediction
                toward or away from failure.
              </p>

              <div
                className={`mt-8 rounded-[24px] border p-5 text-white ${
                  dark
                    ? "border-slate-700 bg-[#0b1424]"
                    : "border-transparent bg-[#0a1a3c]"
                }`}
              >
                <BrainCircuit
                  size={18}
                  className="text-blue-400"
                />

                <p className="mt-5 text-[13px] font-bold">
                  Model explanation
                </p>

                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                  {result
                    ? "The factors shown here were returned directly by the SHAP explainer for this inference."
                    : "Run an analysis to generate a live SHAP explanation."}
                </p>
              </div>
            </div>

            <div
              className={`rounded-[30px] border p-6 sm:p-8 ${
                dark
                  ? "border-slate-800 bg-[#0b1424]"
                  : "border-slate-200 bg-white"
              }`}
            >
              {!result ? (
                <div className="grid min-h-[340px] place-items-center text-center">
                  <div>
                    <Activity
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-4 text-[11px] font-bold text-slate-400">
                      No SHAP result yet
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`grid grid-cols-[1fr_80px] border-b pb-3 text-[9px] font-black uppercase tracking-[.14em] text-slate-400 sm:grid-cols-[1.3fr_1fr_80px] ${
                    dark ? "border-slate-800" : "border-slate-100"
                  }`}>
                    <span>Feature</span>
                    <span className="hidden sm:block">
                      Contribution
                    </span>
                    <span className="text-right">
                      SHAP
                    </span>
                  </div>

                  {factors.map((factor, index) => {
                    const positive =
                      factor.shap_value >= 0;

                    return (
                      <motion.div
                        key={`${factor.feature}-${index}`}
                        initial={{
                          opacity: 0,
                          x: 12,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * 0.07,
                        }}
                        className={`grid grid-cols-[1fr_80px] items-center gap-4 border-b py-5 last:border-0 sm:grid-cols-[1.3fr_1fr_80px] ${
                          dark ? "border-slate-800" : "border-slate-100"
                        }`}
                      >
                        <div>
                          <p className="break-all text-[11px] font-black">
                            {cleanFeatureName(
                              factor.feature
                            )}
                          </p>

                          <p
                            className={`mt-1 text-[9px] font-bold ${
                              positive
                                ? "text-red-500"
                                : "text-emerald-500"
                            }`}
                          >
                            {factor.impact}
                          </p>
                        </div>

                        <div className="hidden sm:block">
                          <div
                            className={`h-2 overflow-hidden rounded-full ${
                              dark ? "bg-slate-800" : "bg-slate-100"
                            }`}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${factor.strength}%`,
                              }}
                              transition={{
                                duration: 0.7,
                              }}
                              className={`h-full rounded-full ${
                                positive
                                  ? "bg-[#1358e8]"
                                  : "bg-emerald-400"
                              }`}
                            />
                          </div>
                        </div>

                        <p
                          className={`text-right text-[10px] font-black ${
                            positive
                              ? "text-red-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {factor.shap_value > 0
                            ? "+"
                            : ""}
                          {factor.shap_value.toFixed(4)}
                        </p>
                      </motion.div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InputMetric({
  icon: Icon,
  label,
  value,
  unit,
  onChange,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  unit: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <Icon
            size={13}
            className="text-[#1358e8]"
          />
          {label}
        </span>
      </div>

      <div className="aegis-dark-input flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[12px] font-bold text-[#0b1838] outline-none dark:text-white"
        />

        <span className="border-l border-slate-200 px-3 text-[9px] font-bold text-slate-400 dark:border-slate-700">
          {unit}
        </span>
      </div>
    </div>
  );
}

function MiniResult({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur">
      <Icon
        size={15}
        className="text-blue-200"
      />

      <p className="mt-5 text-lg font-black">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-bold uppercase tracking-[.15em] text-blue-200">
        {label}
      </p>
    </div>
  );
}

function cleanFeatureName(feature: string) {
  return feature
    .replace("numeric__", "")
    .replace("categorical__", "")
    .replaceAll("_", " ");
}

function riskStyle(risk: string) {
  const value = risk.toLowerCase();

  if (value.includes("critical")) {
    return "bg-red-500 text-white";
  }

  if (
    value.includes("high") ||
    value.includes("medium")
  ) {
    return "bg-amber-400 text-[#0b1838]";
  }

  return "bg-emerald-400 text-[#062b20]";
}
