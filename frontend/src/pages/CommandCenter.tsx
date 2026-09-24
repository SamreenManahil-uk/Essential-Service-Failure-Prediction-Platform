import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav";
import { useTheme } from "../theme/ThemeContext";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Building2,
  ChevronRight,
  CircleDot,
  Droplets,
  Factory,
  Radio,
  ShieldCheck,
  Sparkles,
  TrainFront,
  TriangleAlert,
  Zap,
} from "lucide-react";

const stats = [
  { value: "24", label: "Connected Assets", note: "Across 5 sectors" },
  { value: "19", label: "Healthy Systems", note: "Operating normally" },
  { value: "03", label: "High Risk", note: "Requires attention" },
  { value: "02", label: "Critical", note: "Immediate action" },
];

const sectors = [
  {
    icon: Building2,
    number: "01",
    title: "Healthcare",
    description:
      "Monitor generators, HVAC and life-critical hospital infrastructure.",
  },
  {
    icon: Zap,
    number: "02",
    title: "Energy",
    description:
      "Predict equipment degradation across essential power systems.",
  },
  {
    icon: Droplets,
    number: "03",
    title: "Water",
    description:
      "Detect abnormal behaviour before pumps and treatment assets fail.",
  },
  {
    icon: TrainFront,
    number: "04",
    title: "Transport",
    description:
      "Transform machine telemetry into actionable maintenance intelligence.",
  },
];

export default function CommandCenter() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <main
      className={`min-h-screen overflow-hidden transition-colors duration-300 ${
        dark
          ? "bg-[#050b16] text-slate-100"
          : "bg-[#f7f9fc] text-[#0b1838]"
      }`}
    >

      <TopNav />

      {/* HERO */}
      <section
        className={`relative transition-colors duration-300 ${
          dark ? "bg-[#07101f]" : "bg-white"
        }`}
      >
        <div className="absolute left-0 top-0 h-full w-[7px] bg-[#1358e8]" />

        <div className="mx-auto grid min-h-[670px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:px-12 lg:py-20">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-10"
          >
            <div className={`mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#1358e8] ${
                dark ? "bg-blue-500/10" : "bg-[#edf3ff]"
              }`}>
              <Sparkles size={13} />
              AI-powered essential services
            </div>

            <h1 className={`max-w-[720px] text-[48px] font-black leading-[.98] tracking-[-.055em] sm:text-[64px] lg:text-[72px] xl:text-[82px] ${
                dark ? "text-white" : "text-[#091735]"
              }`}>
              Predict failure
              <span className="block text-[#1358e8]">
                before impact.
              </span>
            </h1>

            <p className={`mt-7 max-w-[590px] text-[16px] leading-7 sm:text-[18px] ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}>
              A real-time intelligence platform that turns
              infrastructure telemetry into early warnings,
              explainable predictions and faster operational
              decisions.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/assets" className="group flex items-center gap-3 rounded-full bg-[#1358e8] px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_15px_35px_rgba(19,88,232,.24)] transition hover:-translate-y-0.5 hover:bg-[#0e49c5]">
                Explore Infrastructure
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <div className={`flex items-center gap-2 px-3 text-[12px] font-semibold ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Network operational
              </div>
            </div>
          </motion.div>

          {/* HERO VISUAL */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto min-h-[480px] w-full max-w-[690px]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[42px] bg-[#1358e8]">

              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[55px] border-white/[.08]" />

              <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-[70px] border-white/[.07]" />

              <div
                className="absolute inset-0 opacity-[.12]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                  backgroundSize: "42px 42px",
                }}
              />

              <div className="relative flex h-full min-h-[480px] flex-col justify-between p-7 text-white sm:p-10">

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.22em] text-blue-200">
                      Live Asset Intelligence
                    </p>
                    <p className="mt-2 text-xl font-bold">
                      Manchester Network
                    </p>
                  </div>

                  <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] backdrop-blur">
                    LIVE
                  </div>
                </div>

                <div className="relative mx-auto h-[230px] w-full max-w-[460px]">

                  <div className="absolute left-[12%] top-[18%] h-px w-[37%] rotate-[16deg] bg-white/30" />
                  <div className="absolute left-[45%] top-[27%] h-px w-[38%] -rotate-[21deg] bg-white/30" />
                  <div className="absolute left-[22%] top-[61%] h-px w-[35%] -rotate-[22deg] bg-white/30" />
                  <div className="absolute left-[52%] top-[60%] h-px w-[30%] rotate-[20deg] bg-white/30" />

                  <Node
                    icon={Building2}
                    label="Hospital"
                    className="left-[4%] top-[7%]"
                  />

                  <Node
                    icon={Zap}
                    label="Power"
                    className="right-[5%] top-[9%]"
                  />

                  <Node
                    icon={Factory}
                    label="Generator 01"
                    critical
                    className="left-[39%] top-[37%]"
                  />

                  <Node
                    icon={Droplets}
                    label="Water"
                    className="left-[12%] bottom-[2%]"
                  />

                  <Node
                    icon={TrainFront}
                    label="Transit"
                    className="right-[8%] bottom-[3%]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-blue-100">
                      <BrainCircuit size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-[.15em]">
                        Prediction
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-black">
                      99.89%
                    </p>
                    <p className="text-[10px] text-blue-100">
                      Generator failure risk
                    </p>
                  </div>

                  <div
                    className={`rounded-[22px] border p-4 transition-colors ${
                      dark
                        ? "border-white/10 bg-[#0b1424] text-white"
                        : "border-transparent bg-white text-[#0b1838]"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-red-500">
                      <TriangleAlert size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-[.15em]">
                        Priority
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-black">
                      Critical
                    </p>
                    <p
                      className={`text-[10px] ${
                        dark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Response required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* METRICS */}
      <section
        className={`border-y transition-colors duration-300 ${
          dark
            ? "border-slate-800 bg-[#050b16]"
            : "border-slate-200 bg-[#f7f9fc]"
        }`}
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`py-9 lg:px-7 ${
                index !== stats.length - 1
                  ? dark
                    ? "lg:border-r lg:border-slate-800"
                    : "lg:border-r lg:border-slate-200"
                  : ""
              }`}
            >
              <p className={`text-4xl font-black tracking-[-.05em] ${
                dark ? "text-white" : "text-[#0b1838]"
              }`}>
                {stat.value}
              </p>
              <p className="mt-2 text-[12px] font-bold">
                {stat.label}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                {stat.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INFRASTRUCTURE SECTORS */}
      <section
        className={`py-24 transition-colors duration-300 ${
          dark ? "bg-[#07101f]" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#1358e8]">
                Essential infrastructure
              </p>

              <h2 className="mt-4 max-w-md text-4xl font-black leading-[1.05] tracking-[-.045em] sm:text-5xl">
                One intelligence layer.
                <span className={`block ${dark ? "text-slate-600" : "text-slate-300"}`}>
                  Every critical system.
                </span>
              </h2>
            </div>

            <p
              className={`max-w-xl self-end text-[15px] leading-7 lg:justify-self-end ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              AegisGrid connects operational signals across
              critical sectors and turns machine behaviour into
              actionable risk intelligence.
            </p>
          </div>

          <div
            className={`mt-14 grid border-y md:grid-cols-2 xl:grid-cols-4 ${
              dark ? "border-slate-800" : "border-slate-200"
            }`}
          >
            {sectors.map((sector, index) => {
              const Icon = sector.icon;

              return (
                <motion.article
                  key={sector.title}
                  whileHover={{ y: -7 }}
                  className={`group relative min-h-[330px] cursor-pointer p-7 transition ${
                    index !== sectors.length - 1
                      ? dark
                        ? "xl:border-r xl:border-slate-800"
                        : "xl:border-r xl:border-slate-200"
                      : ""
                  } ${
                    index < 2
                      ? dark
                        ? "max-md:border-b max-md:border-slate-800"
                        : "max-md:border-b max-md:border-slate-200"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`grid h-12 w-12 place-items-center rounded-full text-[#1358e8] transition group-hover:bg-[#1358e8] group-hover:text-white ${
                        dark ? "bg-blue-500/10" : "bg-[#edf3ff]"
                      }`}>
                      <Icon size={20} />
                    </div>

                    <span className="text-[10px] font-bold text-slate-300">
                      {sector.number}
                    </span>
                  </div>

                  <div className="mt-20">
                    <h3 className="text-2xl font-black tracking-[-.035em]">
                      {sector.title}
                    </h3>

                    <p
                      className={`mt-3 text-[13px] leading-6 ${
                        dark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {sector.description}
                    </p>

                    <button className="mt-6 flex items-center gap-2 text-[11px] font-bold text-[#1358e8]">
                      View systems
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI INTELLIGENCE */}
      <section
        className={`py-24 text-white ${
          dark ? "bg-[#020711]" : "bg-[#0a1a3c]"
        }`}
      >
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">

          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-blue-300">
              <BrainCircuit size={14} />
              Explainable intelligence
            </div>

            <h2 className="mt-5 max-w-xl text-4xl font-black leading-[1.04] tracking-[-.045em] sm:text-5xl">
              Not just a warning.
              <span className="block text-blue-400">
                An explanation.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-[14px] leading-7 text-slate-400">
              XGBoost identifies failure probability while SHAP
              reveals which operational signals are driving the
              prediction.
            </p>

            <div className="mt-10 flex items-center gap-8">
              <div>
                <p className="text-4xl font-black">
                  99.89%
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[.15em] text-slate-500">
                  Failure probability
                </p>
              </div>

              <div className="h-12 w-px bg-white/10" />

              <div>
                <p className="text-4xl font-black text-red-400">
                  24h
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[.15em] text-slate-500">
                  Prediction window
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-[34px] border p-6 sm:p-8 ${
              dark
                ? "border-slate-700 bg-[#0b1424] text-white"
                : "border-transparent bg-white text-[#0b1838]"
            }`}
          >

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#1358e8]">
                  SHAP Analysis
                </p>
                <h3 className="mt-1 text-xl font-black">
                  Why is risk critical?
                </h3>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-500">
                <Activity size={18} />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <Factor
                label="Torque"
                value="+4.64"
                width="95%"
              />
              <Factor
                label="Tool wear"
                value="+2.79"
                width="68%"
              />
              <Factor
                label="Process temperature"
                value="-1.19"
                width="37%"
                negative
              />
              <Factor
                label="Air temperature"
                value="+0.93"
                width="29%"
              />
            </div>

            <div
              className={`mt-8 flex items-start gap-3 rounded-2xl p-4 ${
                dark ? "bg-slate-900" : "bg-[#f4f7fc]"
              }`}
            >
              <CircleDot
                size={16}
                className="mt-0.5 shrink-0 text-[#1358e8]"
              />
              <p
                className={`text-[11px] leading-5 ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Elevated torque and tool wear are the strongest
                contributors to the current failure prediction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section
        className={`py-20 text-white ${
          dark ? "bg-[#0b3fa8]" : "bg-[#1358e8]"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-200">
                Intelligence pipeline
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">
                From signal to action.
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-blue-100">
              <Radio size={14} />
              Streaming architecture active
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[28px] bg-white/20 md:grid-cols-5">
            {[
              ["01", "Sensors"],
              ["02", "Kafka"],
              ["03", ".NET API"],
              ["04", "XGBoost + SHAP"],
              ["05", "Incident"],
            ].map(([number, title]) => (
              <div
                key={number}
                className={`p-6 transition hover:bg-white/10 ${
                  dark ? "bg-[#0b3fa8]" : "bg-[#1358e8]"
                }`}
              >
                <p className="text-[9px] font-bold text-blue-200">
                  {number}
                </p>
                <p className="mt-9 text-[14px] font-bold">
                  {title}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <footer
        className={`px-5 py-8 text-white sm:px-8 lg:px-12 ${
          dark ? "border-t border-slate-800 bg-[#020711]" : "bg-[#07142f]"
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 text-[10px] text-slate-500 sm:flex-row">
          <span>
            AEGISGRID / Essential Service Failure Prediction
          </span>

          <div className="flex items-center gap-2">
            <ShieldCheck size={13} />
            JWT secured • Engineer access
          </div>
        </div>
      </footer>

    </main>
  );
}

function Node({
  icon: Icon,
  label,
  className,
  critical = false,
}: {
  icon: typeof Activity;
  label: string;
  className: string;
  critical?: boolean;
}) {
  return (
    <motion.div
      animate={
        critical
          ? {
              scale: [1, 1.05, 1],
            }
          : undefined
      }
      transition={{
        repeat: Infinity,
        duration: 2.5,
      }}
      className={`absolute ${className}`}
    >
      <div
        className={`grid h-14 w-14 place-items-center rounded-full border backdrop-blur ${
          critical
            ? "border-red-300 bg-red-500 shadow-[0_0_0_8px_rgba(248,113,113,.12)]"
            : "border-white/30 bg-white/15"
        }`}
      >
        <Icon size={19} />
      </div>

      <p className="mt-2 whitespace-nowrap text-center text-[9px] font-semibold text-blue-100">
        {label}
      </p>
    </motion.div>
  );
}

function Factor({
  label,
  value,
  width,
  negative = false,
}: {
  label: string;
  value: string;
  width: string;
  negative?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold">
          {label}
        </span>
        <span
          className={`text-[10px] font-black ${
            negative
              ? "text-emerald-500"
              : "text-red-500"
          }`}
        >
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${
            negative
              ? "bg-emerald-400"
              : "bg-[#1358e8]"
          }`}
        />
      </div>
    </div>
  );
}
