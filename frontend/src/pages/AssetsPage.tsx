import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  ChevronRight,
  CircleCheck,
  Droplets,
  Factory,
  Gauge,
  MapPin,
  Search,
  TrainFront,
  TriangleAlert,
  Zap,
} from "lucide-react";
import TopNav from "../components/TopNav";
import api from "../api/client";
import { useTheme } from "../theme/ThemeContext";

type Asset = {
  id: number;
  name: string;
  assetType: string;
  location: string;
  status: string;
  createdAt?: string;
};



export default function AssetsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All assets");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssets() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/assets");
        setAssets(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load assets from the API.");
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, []);

  const assetTypes = useMemo(() => {
    return [
      "All assets",
      ...Array.from(
        new Set(
          assets
            .map((asset) => asset.assetType)
            .filter(Boolean)
        )
      ),
    ];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch =
        !query ||
        [
          String(asset.id),
          `AG-${String(asset.id).padStart(3, "0")}`,
          asset.name,
          asset.assetType,
          asset.location,
          asset.status,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesType =
        selectedType === "All assets" ||
        asset.assetType === selectedType;

      const matchesStatus =
        selectedStatus === "All" ||
        asset.status?.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, searchQuery, selectedType, selectedStatus]);

  const healthyCount = assets.filter(
    (asset) => asset.status?.toLowerCase() === "healthy"
  ).length;

  const highCount = assets.filter(
    (asset) => asset.status?.toLowerCase() === "high risk"
  ).length;

  const criticalCount = assets.filter(
    (asset) => asset.status?.toLowerCase() === "critical"
  ).length;

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-[#050b16] text-slate-100"
          : "bg-[#f4f7fb] text-[#0b1838]"
      }`}
    >
      <TopNav />

      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#1358e8]">
              Infrastructure fleet
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">
              Asset Explorer
            </h1>
            <p className={`mt-3 max-w-xl text-[14px] leading-6 ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}>
              Explore monitored infrastructure, operational health
              and predictive failure risk across essential services.
            </p>
          </div>

          <div className="relative w-full lg:w-[340px]">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search asset, location or ID..."
              className={`w-full rounded-full border py-3.5 pl-11 pr-5 text-[12px] outline-none transition ${
                dark
                  ? "border-slate-700 bg-[#0b1424] text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  : "border-slate-200 bg-white text-[#0b1838] focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              }`}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[250px_1fr]">

          {/* FILTER RAIL */}
          <aside
            className={`h-fit rounded-[28px] border p-6 text-white lg:sticky lg:top-24 ${
              dark
                ? "border-slate-700 bg-[#07101f]"
                : "border-transparent bg-[#0a1a3c]"
            }`}
          >
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-blue-300">
              Fleet scope
            </p>

            <div className="mt-6 space-y-2">
              {assetTypes.map((label) => {
                const count =
                  label === "All assets"
                    ? assets.length
                    : assets.filter(
                        (asset) => asset.assetType === label
                      ).length;

                const active = selectedType === label;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedType(label)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[11px] font-semibold transition ${
                      active
                        ? "bg-white text-[#0b1838]"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {label}
                    <span className="text-[9px]">
                      {String(count).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="my-6 h-px bg-white/10" />

            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-blue-300">
              Risk status
            </p>

            <div className="mt-5 space-y-4 text-[11px]">
              <button
                type="button"
                onClick={() =>
                  setSelectedStatus(
                    selectedStatus === "Healthy" ? "All" : "Healthy"
                  )
                }
                className="w-full"
              >
                <StatusDot
                  label="Healthy"
                  count={String(healthyCount).padStart(2, "0")}
                  type="healthy"
                  active={selectedStatus === "Healthy"}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedStatus(
                    selectedStatus === "High Risk" ? "All" : "High Risk"
                  )
                }
                className="w-full"
              >
                <StatusDot
                  label="High Risk"
                  count={String(highCount).padStart(2, "0")}
                  type="high"
                  active={selectedStatus === "High Risk"}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedStatus(
                    selectedStatus === "Critical" ? "All" : "Critical"
                  )
                }
                className="w-full"
              >
                <StatusDot
                  label="Critical"
                  count={String(criticalCount).padStart(2, "0")}
                  type="critical"
                  active={selectedStatus === "Critical"}
                />
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-[#1358e8] p-4">
              <Activity size={18} />
              <p className="mt-5 text-2xl font-black">{assets.length}</p>
              <p className="text-[9px] uppercase tracking-[.15em] text-blue-100">
                Live connections
              </p>
            </div>
          </aside>

          {/* ASSET WORKSPACE */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <p className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Showing {filteredAssets.length} of {assets.length} monitored assets
              </p>
              <p className="text-[10px] text-slate-400">
                Risk ↓
              </p>
            </div>

            <div className="space-y-3">
              {filteredAssets.length === 0 && (
                <div
                  className={`rounded-[24px] border px-6 py-14 text-center ${
                    dark
                      ? "border-slate-800 bg-[#0b1424]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Search
                    size={26}
                    className="mx-auto text-slate-400"
                  />

                  <h3 className="mt-4 text-[15px] font-black">
                    No assets found
                  </h3>

                  <p className="mt-2 text-[11px] text-slate-400">
                    No monitored asset matches “{searchQuery}”.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-5 rounded-full bg-[#1358e8] px-5 py-2.5 text-[10px] font-black text-white transition hover:bg-[#0d49c7]"
                  >
                    Clear search
                  </button>
                </div>
              )}

              {loading && (
                <div className="aegis-dark-card rounded-[24px] border border-slate-200 bg-white p-8 text-center">
                  <Activity className="mx-auto animate-pulse text-[#1358e8]" size={22} />
                  <p className="mt-3 text-[11px] font-bold text-slate-400">
                    Loading assets...
                  </p>
                </div>
              )}

              {!loading && error && (
                <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-center text-[11px] font-bold text-red-600">
                  {error}
                </div>
              )}

              {!loading && !error && filteredAssets.map((asset, index) => {
                const Icon =
                  asset.assetType.toLowerCase().includes("generator")
                    ? Building2
                    : asset.assetType.toLowerCase().includes("pump")
                      ? Droplets
                      : asset.assetType.toLowerCase().includes("power") ||
                          asset.assetType.toLowerCase().includes("transform")
                        ? Zap
                        : asset.assetType.toLowerCase().includes("transport") ||
                            asset.assetType.toLowerCase().includes("motor")
                          ? TrainFront
                          : Factory;

                const displayId =
                  `AG-${String(asset.id).padStart(3, "0")}`;

                const risk =
                  asset.status?.toLowerCase() === "critical"
                    ? 99.89
                    : asset.status?.toLowerCase() === "high risk"
                      ? 76.2
                      : 8.4;

                const signal =
                  asset.status?.toLowerCase() === "critical"
                    ? "Critical anomaly detected"
                    : asset.status?.toLowerCase() === "high risk"
                      ? "Elevated failure risk"
                      : "Normal operation";

                return (
                  <motion.article
                    key={asset.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                    className={`group overflow-hidden rounded-[24px] border transition ${
                      dark
                        ? "border-slate-800 bg-[#0b1424] hover:border-blue-500/60 hover:bg-[#0e192b] hover:shadow-[0_18px_50px_rgba(0,0,0,.22)]"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-[0_15px_45px_rgba(20,45,90,.08)]"
                    }`}
                  >
                    <div className="grid items-center gap-5 p-5 md:grid-cols-[56px_1.3fr_.8fr_.7fr_38px]">

                      <div className={`grid h-14 w-14 place-items-center rounded-2xl text-[#1358e8] ${
                        dark ? "bg-blue-500/10" : "bg-[#edf3ff]"
                      }`}>
                        <Icon size={21} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[15px] font-black">
                            {asset.name}
                          </h2>
                          <span className="text-[9px] font-bold text-slate-300">
                            {displayId}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {asset.location}
                          </span>
                          <span>{asset.assetType}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">
                          Latest signal
                        </p>
                        <p className="mt-1 text-[11px] font-semibold">
                          {signal}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-end justify-between">
                          <span className="text-[9px] font-bold uppercase text-slate-400">
                            Failure risk
                          </span>
                          <span className="text-[12px] font-black">
                            {risk}%
                          </span>
                        </div>

                        <div
                          className={`mt-2 h-1.5 overflow-hidden rounded-full ${
                            dark ? "bg-slate-800" : "bg-slate-100"
                          }`}
                        >
                          <div
                            className={`h-full rounded-full ${
                              asset.status === "Critical"
                                ? "bg-red-500"
                                : asset.status === "High Risk"
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                            }`}
                            style={{
                              width: `${risk}%`,
                            }}
                          />
                        </div>

                        <p
                          className={`mt-2 text-[9px] font-bold ${
                            asset.status === "Critical"
                              ? "text-red-500"
                              : asset.status === "High Risk"
                                ? "text-amber-500"
                                : "text-emerald-500"
                          }`}
                        >
                          {asset.status}
                        </p>
                      </div>

                      <button
                        className={`grid h-9 w-9 place-items-center rounded-full border transition group-hover:border-[#1358e8] group-hover:bg-[#1358e8] group-hover:text-white ${
                          dark
                            ? "border-slate-700 text-slate-400"
                            : "border-slate-200"
                        }`}
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Summary
                icon={CircleCheck}
                title="Fleet Health"
                value="79%"
              />
              <Summary
                icon={Gauge}
                title="Average Risk"
                value="18.6%"
              />
              <Summary
                icon={TriangleAlert}
                title="Attention"
                value="05"
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatusDot({
  label,
  count,
  type,
  active = false,
}: {
  label: string;
  count: string;
  type: "healthy" | "high" | "critical";
  active?: boolean;
}) {
  const colour =
    type === "healthy"
      ? "bg-emerald-400"
      : type === "high"
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-2 transition ${
        active ? "bg-white/10" : ""
      }`}
    >
      <span className="flex items-center gap-2 text-slate-300">
        <span className={`h-2 w-2 rounded-full ${colour}`} />
        {label}
      </span>
      <span className="text-slate-500">{count}</span>
    </div>
  );
}

function Summary({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Activity;
  title: string;
  value: string;
}) {
  return (
    <div className="aegis-dark-card rounded-[22px] border border-slate-200 bg-white p-5 transition-colors">
      <Icon size={17} className="text-[#1358e8]" />
      <p className="mt-6 text-3xl font-black tracking-[-.04em]">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
        {title}
      </p>
    </div>
  );
}
