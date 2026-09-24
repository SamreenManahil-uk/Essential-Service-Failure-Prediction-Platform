import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Database,
  Factory,
  Radio,
  Server,
  Zap,
} from "lucide-react";
import TopNav from "../components/TopNav";
import { useTheme } from "../theme/ThemeContext";
import { connectAuthenticatedSse } from "../api/authenticatedSse";

type LiveEvent = {
  source: string;
  message: string;
  type: string;
  timestamp: string;
  assetId?: number | null;
  failureProbability?: number | null;
  riskLevel?: string | null;
};

const API_URL = "http://localhost:5249";

export default function LiveNetworkPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastPrediction, setLastPrediction] =
    useState<LiveEvent | null>(null);

  useEffect(() => {
    const disconnect = connectAuthenticatedSse(
      `${API_URL}/api/live-events/stream`,
      {
        onOpen: () => {
          setConnected(true);
        },

        onConnected: () => {
          setConnected(true);
        },

        onMessage: (data) => {
          try {
            const incoming: LiveEvent = JSON.parse(data);

            setEvents((current) =>
              [incoming, ...current].slice(0, 50)
            );

            if (
              incoming.failureProbability !== null &&
              incoming.failureProbability !== undefined
            ) {
              setLastPrediction(incoming);
            }
          } catch (error) {
            console.error(
              "Unable to parse live pipeline event:",
              error
            );
          }
        },

        onError: (error) => {
          setConnected(false);

          console.error(
            "Authenticated live stream error:",
            error
          );
        },
      }
    );

    return disconnect;
  }, []);

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-[#030914] text-white"
          : "bg-[#edf3f8] text-[#0b1838]"
      }`}
    >

      {/* HEADER */}
      <TopNav />

      {/* SYSTEM BAR */}
      <section
        className={`border-b ${
          dark
            ? "border-white/[.07] bg-[#07111f]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4 lg:px-12">
          <SystemMetric
            label="Kafka"
            value="ONLINE"
            good
          />
          <SystemMetric
            label="Live Stream"
            value={connected ? "CONNECTED" : "RECONNECTING"}
            good={connected}
          />
          <SystemMetric
            label="Consumer Lag"
            value="0"
            good
          />
          <SystemMetric
            label="Topic"
            value="sensor-readings"
          />
        </div>
      </section>

      {/* MAIN NETWORK AREA */}
      <section className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-12">

        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-cyan-400">
              <Radio size={13} />
              Real-time event processing
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">
              Infrastructure Network
            </h1>
          </div>

          <p
            className={`max-w-md font-mono text-[9px] leading-5 ${
              dark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            SENSOR → KAFKA → .NET → ML → SHAP → DATABASE → INCIDENT
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">

          {/* TOPOLOGY */}
          <section
            className={`relative min-h-[570px] overflow-hidden rounded-[24px] border ${
              dark
                ? "border-white/[.08] bg-[#06101d]"
                : "border-blue-100 bg-white shadow-[0_18px_55px_rgba(25,60,110,.08)]"
            }`}
          >

            <div
              className="absolute inset-0 opacity-[.12]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(56,189,248,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.35) 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,.08),transparent_60%)]" />

            <div
              className={`relative z-10 flex items-center justify-between border-b px-5 py-4 ${
                dark ? "border-white/[.07]" : "border-slate-100"
              }`}
            >
              <div>
                <p className="font-mono text-[9px] font-bold text-cyan-400">
                  NETWORK_TOPOLOGY
                </p>
                <p className="mt-1 font-mono text-[8px] text-slate-600">
                  Essential Service Prediction Pipeline
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-[8px] text-emerald-400">
                <CircleDot size={11} />
                {connected ? "LIVE" : "RECONNECTING"}
              </div>
            </div>

            <div className="relative min-h-[490px]">

              {/* CONNECTIONS */}
              <div className="absolute left-[14%] top-[31%] h-px w-[20%] bg-gradient-to-r from-cyan-500/70 to-blue-500/20" />

              <div className="absolute left-[39%] top-[31%] h-px w-[18%] bg-gradient-to-r from-blue-500/70 to-violet-500/20" />

              <div className="absolute left-[62%] top-[31%] h-px w-[20%] bg-gradient-to-r from-violet-500/70 to-cyan-500/20" />

              <div className="absolute left-[25%] top-[67%] h-px w-[20%] bg-gradient-to-r from-cyan-500/70 to-blue-500/20" />

              <div className="absolute left-[50%] top-[67%] h-px w-[20%] bg-gradient-to-r from-blue-500/70 to-emerald-500/20" />

              {/* MOVING SIGNALS */}
              <motion.div
                animate={{ left: ["14%", "34%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-[30.3%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,1)]"
              />

              <motion.div
                animate={{ left: ["39%", "57%"] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.5,
                }}
                className="absolute top-[30.3%] h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_15px_rgba(147,197,253,1)]"
              />

              <NetworkNode
                icon={Factory}
                title="SENSOR"
                subtitle="AG-001"
                className="left-[6%] top-[20%]"
                colour="cyan"
              />

              <NetworkNode
                icon={Radio}
                title="KAFKA"
                subtitle="9092"
                className="left-[31%] top-[20%]"
                colour="blue"
              />

              <NetworkNode
                icon={Server}
                title=".NET"
                subtitle="CONSUMER"
                className="left-[54%] top-[20%]"
                colour="violet"
              />

              <NetworkNode
                icon={BrainCircuit}
                title="XGBOOST"
                subtitle="FASTAPI"
                className="right-[7%] top-[20%]"
                colour="cyan"
              />

              <NetworkNode
                icon={Activity}
                title="SHAP"
                subtitle="EXPLAIN"
                className="left-[17%] top-[56%]"
                colour="cyan"
              />

              <NetworkNode
                icon={Database}
                title="POSTGRES"
                subtitle="5434"
                className="left-[42%] top-[56%]"
                colour="blue"
              />

              <NetworkNode
                icon={Zap}
                title="INCIDENT"
                subtitle="CRITICAL"
                className="right-[18%] top-[56%]"
                colour="red"
              />

              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">
                <MiniStatus
                  dark={dark}
                  label="EVENTS"
                  value={connected ? "LIVE" : "OFFLINE"}
                />
                <MiniStatus
                  dark={dark}
                  label="MODEL"
                  value="READY"
                />
                <MiniStatus
                  dark={dark}
                  label="PIPELINE"
                  value="HEALTHY"
                />
              </div>
            </div>
          </section>

          {/* EVENT STREAM */}
          <section
            className={`overflow-hidden rounded-[24px] border ${
              dark
                ? "border-white/[.08] bg-[#020711]"
                : "border-slate-200 bg-[#07111f] text-white shadow-[0_18px_55px_rgba(25,60,110,.08)]"
            }`}
          >

            <div className="flex items-center justify-between border-b border-white/[.08] px-5 py-4">
              <div>
                <p className="font-mono text-[9px] font-bold text-emerald-400">
                  EVENT_STREAM
                </p>
                <p className="mt-1 font-mono text-[8px] text-slate-600">
                  topic://sensor-readings
                </p>
              </div>

              <span className="font-mono text-[8px] text-slate-500">
                AUTO-SCROLL
              </span>
            </div>

            <div className="p-4 font-mono">
              <div className="mb-4 flex gap-3 border-b border-white/[.05] pb-3 text-[8px] uppercase tracking-[.12em] text-slate-600">
                <span className="w-[58px]">Time</span>
                <span className="w-[62px]">Source</span>
                <span>Event</span>
              </div>

              <div className="space-y-1">

                {events.length === 0 && (
                  <div className="rounded-xl border border-white/[.05] px-4 py-8 text-center">
                    <Radio
                      size={20}
                      className="mx-auto animate-pulse text-cyan-400"
                    />

                    <p className="mt-3 text-[9px] font-bold text-slate-400">
                      {connected
                        ? "LIVE STREAM CONNECTED"
                        : "CONNECTING TO EVENT STREAM"}
                    </p>

                    <p className="mt-2 text-[8px] text-slate-600">
                      Waiting for the next Kafka sensor event...
                    </p>
                  </div>
                )}

                {events.map((event, index) => (
                  <motion.div
                    key={`${event.timestamp}-${event.source}-${index}`}
                    initial={{
                      opacity: 0,
                      x: 10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.07,
                    }}
                    className={`grid grid-cols-[58px_62px_1fr] gap-3 rounded-lg px-2 py-3 text-[8px] leading-4 ${
                      event.type === "CRITICAL"
                        ? "bg-red-500/[.08]"
                        : "hover:bg-white/[.03]"
                    }`}
                  >
                    <span className="text-slate-600">
                      {new Date(
                        event.timestamp
                      ).toLocaleTimeString([], {
                        hour12: false,
                      })}
                    </span>

                    <span
                      className={
                        event.type === "CRITICAL"
                          ? "font-bold text-red-400"
                          : event.type === "AI"
                            ? "text-violet-400"
                            : "text-cyan-400"
                      }
                    >
                      {event.source}
                    </span>

                    <span
                      className={
                        event.type === "CRITICAL"
                          ? "text-red-300"
                          : "text-slate-400"
                      }
                    >
                      {event.message}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-white/[.06] pt-4 text-[8px] text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {connected
                  ? "live connection active — awaiting next event_"
                  : "reconnecting to event stream_"}
              </div>
            </div>
          </section>
        </div>

        {/* PIPELINE TELEMETRY */}
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <TelemetryCard
            dark={dark}
            label="Kafka Consumer"
            value="ACTIVE"
            detail="Group processing normally"
          />

          <TelemetryCard
            dark={dark}
            label="Consumer Lag"
            value="0"
            detail="No queued backlog"
          />

          <TelemetryCard
            dark={dark}
            label="ML Service"
            value="8002"
            detail="FastAPI endpoint online"
          />

          <TelemetryCard
            dark={dark}
            label="Latest Prediction"
            value={
              lastPrediction?.failureProbability != null
                ? `${(
                    lastPrediction.failureProbability * 100
                  ).toFixed(2)}%`
                : "WAITING"
            }
            detail={
              lastPrediction?.riskLevel
                ? `${lastPrediction.riskLevel} • live inference`
                : "Awaiting Kafka event"
            }
            critical={
              lastPrediction?.riskLevel === "Critical"
            }
          />
        </div>

        {/* PIPELINE FOOTER */}
        <div
          className={`mt-5 flex flex-col justify-between gap-3 rounded-[20px] border px-5 py-4 font-mono text-[8px] text-slate-500 sm:flex-row sm:items-center ${
            dark
              ? "border-white/[.07] bg-[#06101d]"
              : "border-slate-200 bg-white"
          }`}
        >

          <span>
            KAFKA TOPIC: sensor-readings
          </span>

          <span className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={11} />
            EVENT PIPELINE OPERATIONAL
          </span>

          <span>
            REDIS CACHE: 6380
          </span>
        </div>

      </section>
    </main>
  );
}

function NetworkNode({
  icon: Icon,
  title,
  subtitle,
  className,
  colour,
}: {
  icon: typeof Activity;
  title: string;
  subtitle: string;
  className: string;
  colour: "cyan" | "blue" | "violet" | "red";
}) {
  const styles = {
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    blue: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    violet:
      "border-violet-400/30 bg-violet-400/10 text-violet-300",
    red: "border-red-400/40 bg-red-400/10 text-red-300",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      className={`absolute ${className} w-[92px] text-center`}
    >
      <div
        className={`mx-auto grid h-[58px] w-[58px] place-items-center rounded-2xl border backdrop-blur ${styles[colour]}`}
      >
        <Icon size={20} />
      </div>

      <p className="mt-2 font-mono text-[9px] font-bold text-[#0b1838] dark:text-white">
        {title}
      </p>

      <p className="mt-0.5 font-mono text-[7px] text-slate-500 dark:text-slate-600">
        {subtitle}
      </p>
    </motion.div>
  );
}

function SystemMetric({
  label,
  value,
  good = false,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="border-r border-slate-200 py-4 last:border-r-0 dark:border-white/[.06] md:px-5">
      <p className="font-mono text-[7px] uppercase tracking-[.15em] text-slate-500 dark:text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1 truncate font-mono text-[9px] font-bold ${
          good
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-cyan-600 dark:text-cyan-300"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStatus({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 backdrop-blur ${
        dark
          ? "border-white/[.06] bg-[#030914]/80 shadow-none"
          : "border-slate-200 bg-white/90 shadow-sm"
      }`}
    >
      <p
        className={`font-mono text-[7px] ${
          dark ? "text-slate-500" : "text-slate-600"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 font-mono text-[8px] font-bold text-emerald-400">
        {value}
      </p>
    </div>
  );
}

function TelemetryCard({
  label,
  value,
  detail,
  critical = false,
  dark,
}: {
  label: string;
  value: string;
  detail: string;
  critical?: boolean;
  dark: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-5 transition-colors ${
        dark
          ? "border-white/[.07] bg-[#06101d] shadow-none"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <p className="font-mono text-[7px] uppercase tracking-[.15em] text-slate-500 dark:text-slate-600">
        {label}
      </p>

      <p
        className={`mt-4 font-mono text-xl font-black ${
          critical
            ? dark
              ? "text-red-400"
              : "text-red-500"
            : dark
              ? "text-white"
              : "text-[#0b1838]"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 font-mono text-[8px] text-slate-500 dark:text-slate-600">
        {detail}
      </p>
    </div>
  );
}
