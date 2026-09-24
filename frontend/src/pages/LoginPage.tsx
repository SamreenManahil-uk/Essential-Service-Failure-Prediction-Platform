import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Moon,
  Radio,
  ShieldCheck,
  Sun,
  Waves,
  Zap,
} from "lucide-react";

import api from "../api/client";
import type { AuthUser } from "../auth/types";
import { useTheme } from "../theme/ThemeContext";

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const [email, setEmail] = useState("engineer@example.com");
  const [password, setPassword] = useState("Engineer123!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post<AuthUser>("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("aegis-token", response.data.token);
      localStorage.setItem("aegis-user", JSON.stringify(response.data));

      onLogin(response.data);
    } catch {
      setError("Access denied. Check your operator credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
        dark
          ? "bg-[#050b16] text-white"
          : "bg-[#f5f8fc] text-[#0b1838]"
      }`}
    >
      {/* TOP BRAND BAR */}
      <header className="absolute left-0 right-0 top-0 z-30">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1358e8] text-white shadow-lg shadow-blue-500/20">
              <Waves size={20} />
            </div>

            <div>
              <p className="text-[13px] font-black tracking-[.14em]">
                AEGISGRID
              </p>
              <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[.24em] text-[#1358e8]">
                Essential Intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`grid h-10 w-10 place-items-center rounded-full border transition ${
              dark
                ? "border-slate-700 bg-slate-900 text-amber-300 hover:bg-slate-800"
                : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:text-[#1358e8]"
            }`}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.08fr_.92fr]">
        {/* VISUAL / PRODUCT SIDE */}
        <section className="relative hidden overflow-hidden bg-[#1358e8] px-12 pb-12 pt-32 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div
            className="absolute inset-0 opacity-[.1]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          <div className="absolute -right-28 top-28 h-[430px] w-[430px] rounded-full border border-white/10" />
          <div className="absolute -right-10 top-48 h-[270px] w-[270px] rounded-full border border-white/10" />

          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[12%] top-[24%] h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_25px_rgba(165,243,252,.9)]"
          />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[9px] font-black uppercase tracking-[.16em] backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              Infrastructure intelligence online
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 max-w-xl text-5xl font-black leading-[.98] tracking-[-.055em] xl:text-6xl"
            >
              Predict critical
              <span className="block text-blue-100">
                failure before impact.
              </span>
            </motion.h1>

            <p className="mt-7 max-w-lg text-[14px] leading-7 text-blue-100">
              AI-powered predictive maintenance for hospitals, energy,
              water, transport and essential infrastructure networks.
            </p>
          </div>

          {/* PIPELINE VISUAL */}
          <div className="relative z-10 my-10">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-100">
                Intelligence pipeline
              </p>

              <span className="flex items-center gap-2 text-[8px] font-bold text-emerald-200">
                <Radio size={10} />
                LIVE
              </span>
            </div>

            <div className="relative grid grid-cols-4 gap-3">
              <div className="absolute left-[10%] right-[10%] top-[29px] h-px bg-white/20" />

              <PipelineNode
                icon={Building2}
                title="Assets"
                detail="24 connected"
              />

              <PipelineNode
                icon={Radio}
                title="Kafka"
                detail="Events live"
              />

              <PipelineNode
                icon={BrainCircuit}
                title="XGBoost"
                detail="AI inference"
              />

              <PipelineNode
                icon={Zap}
                title="Response"
                detail="Incidents"
              />
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            <Signal
              icon={BrainCircuit}
              title="AI MODEL"
              value="XGBoost"
            />
            <Signal
              icon={Activity}
              title="EXPLAINABILITY"
              value="SHAP"
            />
            <Signal
              icon={ShieldCheck}
              title="SECURITY"
              value="JWT + RBAC"
            />
          </div>
        </section>

        {/* LOGIN SIDE */}
        <section
          className={`relative flex items-center justify-center px-6 pb-10 pt-28 sm:px-10 lg:px-14 lg:pt-24 ${
            dark ? "bg-[#07101f]" : "bg-white"
          }`}
        >
          <div
            className={`absolute inset-y-0 left-0 hidden w-px lg:block ${
              dark ? "bg-slate-800" : "bg-slate-100"
            }`}
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="w-full max-w-[440px]"
          >
            {/* MOBILE PRODUCT LABEL */}
            <div className="mb-9 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-[8px] font-black uppercase tracking-[.15em] text-[#1358e8] dark:bg-blue-500/10 dark:text-blue-300">
                <Radio size={10} />
                Infrastructure intelligence online
              </div>
            </div>

            <div className="mb-9">
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl ${
                  dark
                    ? "bg-blue-500/10 text-blue-300"
                    : "bg-blue-50 text-[#1358e8]"
                }`}
              >
                <LockKeyhole size={20} />
              </div>

              <p className="mt-7 text-[9px] font-black uppercase tracking-[.2em] text-[#1358e8]">
                Secure operator access
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-.05em]">
                Welcome back.
              </h2>

              <p
                className={`mt-3 max-w-sm text-[12px] leading-6 ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Sign in to monitor infrastructure health, review AI
                predictions and manage operational incidents.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span
                  className={`mb-2 block text-[9px] font-black uppercase tracking-[.15em] ${
                    dark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Operator Email
                </span>

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-4 text-[12px] font-semibold outline-none transition focus:border-[#1358e8] focus:ring-4 focus:ring-blue-500/10 ${
                    dark
                      ? "border-slate-700 bg-[#0b1424] text-white placeholder:text-slate-600"
                      : "border-slate-200 bg-[#f8fafc] text-[#0b1838]"
                  }`}
                />
              </label>

              <label className="block">
                <span
                  className={`mb-2 block text-[9px] font-black uppercase tracking-[.15em] ${
                    dark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Password
                </span>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    className={`w-full rounded-2xl border px-4 py-4 pr-12 text-[12px] font-semibold outline-none transition focus:border-[#1358e8] focus:ring-4 focus:ring-blue-500/10 ${
                      dark
                        ? "border-slate-700 bg-[#0b1424] text-white"
                        : "border-slate-200 bg-[#f8fafc] text-[#0b1838]"
                    }`}
                  />

                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${
                      dark
                        ? "text-slate-500 hover:text-white"
                        : "text-slate-400 hover:text-[#1358e8]"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div
                  className={`rounded-2xl border p-4 text-[11px] font-semibold ${
                    dark
                      ? "border-red-500/20 bg-red-500/10 text-red-300"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#1358e8] px-5 py-4 text-[11px] font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0d49c7] disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Activity size={15} className="animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Command Center
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div
              className={`mt-8 flex items-center justify-between border-t pt-6 ${
                dark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <div
                className={`flex items-center gap-2 text-[9px] font-semibold ${
                  dark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <ShieldCheck size={13} className="text-emerald-500" />
                JWT secured session
              </div>

              <div
                className={`flex items-center gap-2 text-[9px] font-semibold ${
                  dark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <CheckCircle2 size={13} className="text-[#1358e8]" />
                RBAC enabled
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function PipelineNode({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Activity;
  title: string;
  detail: string;
}) {
  return (
    <div className="relative z-10 text-center">
      <div className="mx-auto grid h-[58px] w-[58px] place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
        <Icon size={18} />
      </div>

      <p className="mt-3 text-[9px] font-black">{title}</p>

      <p className="mt-1 text-[7px] font-semibold uppercase tracking-[.08em] text-blue-200">
        {detail}
      </p>
    </div>
  );
}

function Signal({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Activity;
  title: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
    >
      <Icon size={15} className="text-blue-100" />

      <p className="mt-5 text-[7px] font-black uppercase tracking-[.15em] text-blue-200">
        {title}
      </p>

      <p className="mt-1 text-[11px] font-black">{value}</p>
    </motion.div>
  );
}
