import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  Radio,
  ShieldCheck,
  Siren,
  Wrench,
} from "lucide-react";
import api from "../api/client";
import TopNav from "../components/TopNav";
import { useTheme } from "../theme/ThemeContext";

type Incident = {
  id: number;
  assetId: number;
  failurePredictionId?: number | null;
  title: string;
  severity: string;
  status: string;
  description: string;
  createdAt: string;
  acknowledgedAt?: string | null;
  acknowledgedBy?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  asset?: {
    id?: number;
    name?: string;
    assetType?: string;
    location?: string;
    status?: string;
  } | null;
};

export default function IncidentsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [resolving, setResolving] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadIncidents() {
    try {
      setError("");
      setLoading(true);

      const response = await api.get("/api/incidents");

      const data: Incident[] = Array.isArray(response.data)
        ? response.data
        : [];

      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setIncidents(sorted);

      if (sorted.length > 0) {
        setSelectedId((current) => current ?? sorted[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load incidents from the protected API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  const selected = useMemo(
    () =>
      incidents.find((incident) => incident.id === selectedId) ??
      incidents[0] ??
      null,
    [incidents, selectedId]
  );

  const openCount = incidents.filter(
    (item) => item.status?.toLowerCase() === "open"
  ).length;

  const underReviewCount = incidents.filter(
    (item) => item.status?.toLowerCase() === "under review"
  ).length;

  const criticalCount = incidents.filter(
    (item) =>
      item.severity?.toLowerCase() === "critical" &&
      item.status?.toLowerCase() !== "resolved"
  ).length;

  const resolvedCount = incidents.filter(
    (item) => item.status?.toLowerCase() === "resolved"
  ).length;

  async function acknowledgeIncident(id: number) {
    try {
      setReviewing(id);
      setError("");

      await api.patch(`/api/incidents/${id}/acknowledge`);

      await loadIncidents();
    } catch (err) {
      console.error(err);
      setError(
        "Incident could not be placed under review. Engineer or Admin access is required."
      );
    } finally {
      setReviewing(null);
    }
  }

  async function resolveIncident(id: number) {
    try {
      setResolving(id);
      setError("");

      await api.patch(`/api/incidents/${id}/resolve`);

      await loadIncidents();
    } catch (err) {
      console.error(err);
      setError(
        "Incident could not be resolved. It must be Under Review and Engineer or Admin access is required."
      );
    } finally {
      setResolving(null);
    }
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-[#050b16] text-slate-100"
          : "bg-[#eef2f7] text-[#0b1838]"
      }`}
    >

      {/* HEADER */}
      <TopNav />

      {/* COMMAND STRIP */}
      <section
        className={`border-b text-white ${
          dark
            ? "border-slate-800 bg-[#07101f]"
            : "border-transparent bg-[#0a1a3c]"
        }`}
      >
        <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-blue-300">
                <Radio size={14} />
                Operational response centre
              </div>

              <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">
                Incident Command
              </h1>

              <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-400">
                AI-generated infrastructure alerts become actionable
                incidents for engineering review and response.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-[9px] font-black uppercase tracking-[.14em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              API connected
            </div>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-[24px] bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <CommandMetric
              label="Open incidents"
              value={String(openCount).padStart(2, "0")}
              icon={Siren}
            />
            <CommandMetric
              label="Under review"
              value={String(underReviewCount).padStart(2, "0")}
              icon={Wrench}
            />

            <CommandMetric
              label="Critical active"
              value={String(criticalCount).padStart(2, "0")}
              icon={AlertTriangle}
            />
            <CommandMetric
              label="Resolved"
              value={String(resolvedCount).padStart(2, "0")}
              icon={CheckCircle2}
            />
          </div>
        </div>
      </section>

      {/* MAIN OPERATIONS AREA */}
      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12">

        {error && (
          <div
            className={`mb-5 rounded-2xl border px-5 py-4 text-[11px] font-semibold ${
              dark
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {error}
          </div>
        )}

        {loading && incidents.length === 0 ? (
          <div
              className={`grid min-h-[420px] place-items-center rounded-[30px] border ${
                dark
                  ? "border-slate-800 bg-[#0b1424]"
                  : "border-transparent bg-white"
              }`}
            >
            <div className="text-center">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-[#1358e8]"
              />
              <p className="mt-4 text-[11px] font-bold text-slate-400">
                Loading protected incidents...
              </p>
            </div>
          </div>
        ) : incidents.length === 0 ? (
          <div
              className={`grid min-h-[420px] place-items-center rounded-[30px] border ${
                dark
                  ? "border-slate-800 bg-[#0b1424]"
                  : "border-transparent bg-white"
              }`}
            >
            <div className="text-center">
              <ShieldCheck
                size={36}
                className="mx-auto text-emerald-500"
              />
              <h2 className="mt-5 text-2xl font-black">
                No incidents
              </h2>
              <p className="mt-2 text-[11px] text-slate-400">
                No incident records were returned by the API.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[390px_1fr]">

            {/* INCIDENT QUEUE */}
            <aside
              className={`overflow-hidden rounded-[28px] border ${
                dark
                  ? "border-slate-800 bg-[#0b1424]"
                  : "border-transparent bg-white"
              }`}
            >
              <div
                className={`border-b p-5 ${
                  dark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[.17em] text-[#1358e8]">
                      Response queue
                    </p>
                    <h2 className="mt-1 text-xl font-black">
                      Incidents
                    </h2>
                  </div>

                  <span className={`rounded-full px-3 py-1.5 text-[9px] font-black ${
                    dark
                      ? "bg-slate-900 text-slate-400"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {incidents.length} TOTAL
                  </span>
                </div>
              </div>

              <div className="max-h-[720px] overflow-y-auto">
                {incidents.map((incident) => {
                  const active = selected?.id === incident.id;
                  const resolved =
                    incident.status?.toLowerCase() === "resolved";

                  return (
                    <button
                      key={incident.id}
                      onClick={() => setSelectedId(incident.id)}
                      className={`w-full border-b p-5 text-left transition ${
                        dark ? "border-slate-800" : "border-slate-100"
                      } ${
                        active
                          ? dark
                            ? "bg-blue-500/10"
                            : "bg-[#edf3ff]"
                          : dark
                            ? "bg-[#0b1424] hover:bg-[#0e192b]"
                            : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                            resolved
                              ? "bg-emerald-50 text-emerald-500"
                              : incident.severity?.toLowerCase() ===
                                  "critical"
                                ? "bg-red-50 text-red-500"
                                : "bg-amber-50 text-amber-500"
                          }`}
                        >
                          {resolved ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <AlertTriangle size={15} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-[12px] font-black">
                              {incident.title}
                            </p>

                            <span className="text-[8px] font-bold text-slate-300">
                              #{incident.id}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-[10px] text-slate-400">
                            Asset {incident.assetId}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <SeverityBadge
                              severity={incident.severity}
                            />

                            <span className="text-[9px] text-slate-400">
                              {formatDate(incident.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* SELECTED INCIDENT */}
            {selected && (
              <motion.section
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`overflow-hidden rounded-[28px] border ${
                  dark
                    ? "border-slate-800 bg-[#0b1424]"
                    : "border-transparent bg-white"
                }`}
              >

                {/* DETAIL HEADER */}
                <div
                  className={`border-b p-6 sm:p-8 ${
                    dark ? "border-slate-800" : "border-slate-100"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge
                          severity={selected.severity}
                        />

                        <span
                          className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] ${
                            selected.status?.toLowerCase() ===
                            "resolved"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-blue-50 text-[#1358e8]"
                          }`}
                        >
                          {selected.status}
                        </span>
                      </div>

                      <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-[-.04em]">
                        {selected.title}
                      </h2>

                      <p className={`mt-3 max-w-2xl text-[12px] leading-6 ${
                          dark ? "text-slate-400" : "text-slate-500"
                        }`}>
                        {selected.description ||
                          "Predictive intelligence identified elevated failure risk for this asset."}
                      </p>
                    </div>

                    {selected.status?.toLowerCase() === "open" && (
                      <button
                        onClick={() =>
                          acknowledgeIncident(selected.id)
                        }
                        disabled={reviewing === selected.id}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-[10px] font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reviewing === selected.id ? (
                          <LoaderCircle
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Wrench size={14} />
                        )}

                        {reviewing === selected.id
                          ? "Starting Review..."
                          : "Start Review"}
                      </button>
                    )}

                    {selected.status?.toLowerCase() ===
                      "under review" && (
                      <button
                        onClick={() =>
                          resolveIncident(selected.id)
                        }
                        disabled={resolving === selected.id}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1358e8] px-5 py-3 text-[10px] font-black text-white transition hover:bg-[#0d49c7] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {resolving === selected.id ? (
                          <LoaderCircle
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}

                        {resolving === selected.id
                          ? "Resolving..."
                          : "Resolve Incident"}
                      </button>
                    )}
                  </div>
                </div>

                {/* INCIDENT FACTS */}
                <div
                  className={`grid gap-px sm:grid-cols-2 lg:grid-cols-4 ${
                    dark ? "bg-slate-800" : "bg-slate-100"
                  }`}
                >
                  <Fact
                    dark={dark}
                    icon={Activity}
                    label="Incident ID"
                    value={`#${selected.id}`}
                  />
                  <Fact
                    dark={dark}
                    icon={Wrench}
                    label="Asset"
                    value={
                      selected.asset?.name ??
                      `Asset ${selected.assetId}`
                    }
                  />
                  <Fact
                    dark={dark}
                    icon={MapPin}
                    label="Location"
                    value={
                      selected.asset?.location ??
                      "Infrastructure network"
                    }
                  />
                  <Fact
                    dark={dark}
                    icon={Clock3}
                    label="Created"
                    value={formatDate(selected.createdAt)}
                  />
                </div>

                {/* RESPONSE TIMELINE */}
                <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.1fr_.9fr]">

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#1358e8]">
                      Response lifecycle
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      Incident Timeline
                    </h3>

                    <div className="mt-8">
                      <TimelineItem
                        title="Risk detected"
                        description="XGBoost generated a high-risk failure prediction from incoming machine telemetry."
                        complete
                      />

                      <TimelineItem
                        title="Incident generated"
                        description="AegisGrid automatically created an operational incident from the prediction."
                        complete
                      />

                      <TimelineItem
                        title="Engineer review"
                        description={
                          selected.acknowledgedAt
                            ? `Review started by ${
                                selected.acknowledgedBy ??
                                "an authorised operator"
                              } · ${formatDate(
                                selected.acknowledgedAt
                              )}.`
                            : "Incident is awaiting acknowledgement by an Engineer or Admin."
                        }
                        complete={Boolean(
                          selected.acknowledgedAt
                        )}
                      />

                      <TimelineItem
                        title="Resolution"
                        description={
                          selected.resolvedAt
                            ? `Resolved by ${
                                selected.resolvedBy ??
                                "an authorised operator"
                              } · ${formatDate(
                                selected.resolvedAt
                              )}.`
                            : selected.status?.toLowerCase() ===
                                "under review"
                              ? "Engineering review is active. Resolution is pending."
                              : "Resolution cannot begin until the incident is under review."
                        }
                        complete={
                          selected.status?.toLowerCase() ===
                          "resolved"
                        }
                        last
                      />
                    </div>
                  </div>

                  {/* RESPONSE CARD */}
                  <div
                    className={`rounded-[26px] border p-6 text-white ${
                      dark
                        ? "border-blue-500/20 bg-[#07101f]"
                        : "border-transparent bg-[#0a1a3c]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[.18em] text-blue-300">
                          Operational assessment
                        </p>
                        <h3 className="mt-2 text-xl font-black">
                          Response Priority
                        </h3>
                      </div>

                      <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-blue-300">
                        <Siren size={18} />
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="text-[9px] uppercase tracking-[.15em] text-slate-500">
                        Severity
                      </p>

                      <p
                        className={`mt-2 text-4xl font-black ${
                          selected.severity?.toLowerCase() ===
                          "critical"
                            ? "text-red-400"
                            : "text-amber-300"
                        }`}
                      >
                        {selected.severity}
                      </p>
                    </div>

                    <div className="my-7 h-px bg-white/10" />

                    <div className="space-y-5">
                      <ResponseRow
                        label="Source"
                        value="AI Prediction"
                      />
                      <ResponseRow
                        label="Model"
                        value="XGBoost"
                      />
                      <ResponseRow
                        label="Access"
                        value="Engineer RBAC"
                      />
                      <ResponseRow
                        label="State"
                        value={selected.status}
                      />

                      {selected.acknowledgedBy && (
                        <ResponseRow
                          label="Reviewed by"
                          value={selected.acknowledgedBy}
                        />
                      )}

                      {selected.resolvedBy && (
                        <ResponseRow
                          label="Resolved by"
                          value={selected.resolvedBy}
                        />
                      )}
                    </div>

                    <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
                      <div className="flex gap-3">
                        <ShieldCheck
                          size={16}
                          className="mt-0.5 shrink-0 text-blue-300"
                        />

                        <p className="text-[10px] leading-5 text-slate-300">
                          Resolution actions are protected by JWT
                          authentication and Engineer/Admin
                          role-based access control.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.section>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function CommandMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="bg-[#0a1a3c] p-6 dark:bg-[#07101f]">
      <Icon size={17} className="text-blue-300" />

      <p className="mt-6 text-4xl font-black tracking-[-.05em]">
        {value}
      </p>

      <p className="mt-2 text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const critical =
    severity?.toLowerCase() === "critical";

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] ${
        critical
          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
          : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
      }`}
    >
      {severity}
    </span>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
  dark,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  dark: boolean;
}) {
  return (
    <div
      className={`p-5 transition-colors ${
        dark
          ? "bg-[#0b1424] text-white"
          : "bg-white text-[#0b1838]"
      }`}
    >
      <Icon size={15} className="text-[#1358e8]" />

      <p className="mt-5 text-[9px] font-black uppercase tracking-[.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-bold">
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  title,
  description,
  complete = false,
  last = false,
}: {
  title: string;
  description: string;
  complete?: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-8">
      {!last && (
        <div className="absolute left-[9px] top-5 h-full w-px bg-slate-200 dark:bg-slate-700" />
      )}

      <div
        className={`relative z-10 mt-0.5 h-[19px] w-[19px] shrink-0 rounded-full border-4 ${
          complete
            ? "border-[#1358e8] bg-white dark:bg-[#0b1424]"
            : "border-slate-200 bg-white dark:border-slate-700 dark:bg-[#0b1424]"
        }`}
      />

      <div>
        <p
          className={`text-[11px] font-black ${
            complete
              ? "text-[#0b1838] dark:text-white"
              : "text-slate-400"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 max-w-md text-[10px] leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function ResponseRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0">
      <span className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">
        {label}
      </span>

      <span className="text-[10px] font-bold text-slate-200">
        {value}
      </span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
