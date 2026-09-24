import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BrainCircuit,
  Boxes,
  LogOut,
  Menu,
  Moon,
  Radio,
  Sun,
  ShieldAlert,
  Waves,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import api from "../api/client";
import { toast } from "sonner";
import { connectAuthenticatedSse } from "../api/authenticatedSse";

const links = [
  {
    label: "Overview",
    path: "/",
    icon: Waves,
  },
  {
    label: "Assets",
    path: "/assets",
    icon: Boxes,
  },
  {
    label: "AI Intelligence",
    path: "/intelligence",
    icon: BrainCircuit,
  },
  {
    label: "Incidents",
    path: "/incidents",
    icon: ShieldAlert,
  },
  {
    label: "Live Network",
    path: "/live",
    icon: Radio,
  },
];

type StoredUser = {
  name?: string;
  email?: string;
  role?: string;
};

type IncidentNotification = {
  id: number;
  assetId: number;
  title: string;
  severity: string;
  status: string;
  description: string;
  createdAt: string;
  asset?: {
    name?: string;
    location?: string;
  } | null;
};

export default function TopNav() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [incidents, setIncidents] = useState<IncidentNotification[]>([]);
  const [seenIds, setSeenIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("aegis-seen-notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });



  let user: StoredUser = {};

  try {
    const stored = localStorage.getItem("aegis-user");

    if (stored) {
      user = JSON.parse(stored);
    }
  } catch {
    user = {};
  }

  const name = user.name || "AegisGrid User";
  const role = user.role || "Viewer";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  async function loadNotifications(showNewToasts = true) {
    try {
      const response = await api.get("/api/incidents");

      const data: IncidentNotification[] = Array.isArray(response.data)
        ? response.data
        : [];

      const important = data
        .filter((incident) => {
          const severity = incident.severity?.toLowerCase();
          const status = incident.status?.toLowerCase();

          return (
            status !== "resolved" &&
            (severity === "critical" || severity === "high")
          );
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      setIncidents(important);

      let knownIds: number[] = [];

      try {
        const raw = localStorage.getItem(
          "aegis-known-incident-ids"
        );

        knownIds = raw ? JSON.parse(raw) : [];
      } catch {
        knownIds = [];
      }

      const currentIds = important.map(
        (incident) => incident.id
      );

      // First ever notification load:
      // register everything already in the API as known.
      // Existing incidents must NEVER appear as fresh toasts.
      if (
        !localStorage.getItem(
          "aegis-notification-baseline-created"
        )
      ) {
        localStorage.setItem(
          "aegis-known-incident-ids",
          JSON.stringify(currentIds)
        );

        localStorage.setItem(
          "aegis-notification-baseline-created",
          "true"
        );

        return;
      }

      const knownSet = new Set(knownIds);

      const genuinelyNew = important.filter(
        (incident) => !knownSet.has(incident.id)
      );

      // Immediately persist IDs BEFORE displaying toast.
      // This prevents another poll/remount from displaying
      // the same incident again.
      const updatedKnownIds = Array.from(
        new Set([...knownIds, ...currentIds])
      );

      localStorage.setItem(
        "aegis-known-incident-ids",
        JSON.stringify(updatedKnownIds)
      );

      if (!showNewToasts || genuinelyNew.length === 0) {
        return;
      }

      genuinelyNew.forEach((incident) => {
        const critical =
          incident.severity?.toLowerCase() === "critical";

        const title =
          incident.title ||
          `${incident.severity} infrastructure alert`;

        const description = `${
          incident.asset?.name || `Asset ${incident.assetId}`
        }${
          incident.asset?.location
            ? ` · ${incident.asset.location}`
            : ""
        }`;

        const options = {
          id: `aegis-incident-${incident.id}`,
          description,
          duration: 7000,
          action: {
            label: "View incident",
            onClick: () => navigate("/incidents"),
          },
        };

        if (critical) {
          toast.error(title, options);
        } else {
          toast.warning(title, options);
        }
      });
    } catch (error) {
      console.error(
        "Unable to load notifications",
        error
      );
    }
  }

  useEffect(() => {
    // Load the current incident state once when TopNav mounts.
    // Existing incidents establish the baseline and must not
    // appear as brand-new realtime alerts.
    loadNotifications(false);

    const disconnect = connectAuthenticatedSse(
      "http://localhost:5249/api/live-events/stream",
      {
        onMessage: (data) => {
          try {
            const liveEvent = JSON.parse(data);

            if (liveEvent.source !== "INCIDENT") {
              return;
            }

            // Incident is already stored by the backend.
            // Reload notifications immediately.
            loadNotifications(true);
          } catch (error) {
            console.error(
              "Unable to process realtime notification event:",
              error
            );
          }
        },

        onError: (error) => {
          console.error(
            "Authenticated notification stream error:",
            error
          );
        },
      }
    );

    return disconnect;
  }, []);

  const unreadCount = useMemo(() => {
    const seen = new Set(seenIds);

    return incidents.reduce(
      (count, incident) =>
        seen.has(incident.id) ? count : count + 1,
      0
    );
  }, [incidents, seenIds]);

  function markAllRead() {
    const ids = Array.from(
      new Set([
        ...seenIds,
        ...incidents.map((incident) => incident.id),
      ])
    );

    setSeenIds(ids);
    localStorage.setItem(
      "aegis-seen-notifications",
      JSON.stringify(ids)
    );
  }

  function openIncident(incident: IncidentNotification) {
    const ids = Array.from(
      new Set([...seenIds, incident.id])
    );

    setSeenIds(ids);
    localStorage.setItem(
      "aegis-seen-notifications",
      JSON.stringify(ids)
    );

    setNotificationsOpen(false);
    navigate("/incidents");
  }

  function logout() {
    localStorage.removeItem("aegis-token");
    localStorage.removeItem("aegis-user");
    navigate("/");
    window.location.reload();
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
        theme === "dark"
          ? "border-slate-800 bg-[#07101f]/95 text-white"
          : "border-slate-200/80 bg-white/95 text-[#0b1838]"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">

        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1358e8] text-white shadow-[0_8px_22px_rgba(19,88,232,.2)]">
            <Waves size={19} />
          </div>

          <div>
            <p className="text-[14px] font-black tracking-[.14em]">
              AEGISGRID
            </p>

            <p className="text-[7px] font-bold uppercase tracking-[.24em] text-[#1358e8]">
              Predictive Intelligence
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2.5 text-[11px] font-bold transition ${
                  isActive
                    ? "bg-[#edf3ff] text-[#1358e8]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0b1838]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* USER AREA */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`grid h-10 w-10 place-items-center rounded-full border transition ${
              theme === "dark"
                ? "border-slate-700 bg-slate-900 text-amber-300 hover:border-slate-500"
                : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-[#1358e8]"
            }`}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setNotificationsOpen((current) => !current);
                setProfileOpen(false);
              }}
              className={`relative grid h-10 w-10 place-items-center rounded-full border transition ${
                theme === "dark"
                  ? "border-slate-700 text-slate-300 hover:border-blue-500 hover:text-blue-400"
                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-[#1358e8]"
              }`}
              title="Notifications"
              aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
            >
              <Bell size={16} />

              {unreadCount > 0 && (
                <span
                  className={`absolute -right-1 -top-1 z-20 grid min-h-[19px] min-w-[19px] place-items-center rounded-full border-2 bg-red-500 px-1 text-[8px] font-black leading-none text-white shadow-sm ${
                    theme === "dark"
                      ? "border-[#07101f]"
                      : "border-white"
                  }`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className={`absolute right-0 top-[52px] z-[80] w-[360px] overflow-hidden rounded-[22px] border shadow-[0_22px_70px_rgba(15,23,42,.22)] ${
                  theme === "dark"
                    ? "border-slate-700 bg-[#0b1424] text-white"
                    : "border-slate-200 bg-white text-[#0b1838]"
                }`}
              >
                <div
                  className={`flex items-center justify-between border-b px-5 py-4 ${
                    theme === "dark"
                      ? "border-slate-800"
                      : "border-slate-100"
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-black">
                      Notifications
                    </p>

                    <p className="mt-1 text-[8px] font-semibold text-slate-400">
                      Live operational incidents
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[8px] font-black uppercase tracking-[.1em] text-[#1358e8]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[390px] overflow-y-auto">
                  {incidents.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div
                        className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${
                          theme === "dark"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        <ShieldAlert size={17} />
                      </div>

                      <p className="mt-4 text-[10px] font-black">
                        No active alerts
                      </p>

                      <p className="mt-1 text-[8px] text-slate-400">
                        Critical infrastructure is currently stable.
                      </p>
                    </div>
                  ) : (
                    incidents.slice(0, 8).map((incident) => {
                      const unread = !seenIds.includes(incident.id);
                      const critical =
                        incident.severity?.toLowerCase() ===
                        "critical";

                      return (
                        <button
                          key={incident.id}
                          onClick={() => openIncident(incident)}
                          className={`relative flex w-full gap-3 border-b px-5 py-4 text-left transition ${
                            theme === "dark"
                              ? "border-slate-800 hover:bg-white/[.04]"
                              : "border-slate-100 hover:bg-slate-50"
                          }`}
                        >
                          {unread && (
                            <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#1358e8]" />
                          )}

                          <div
                            className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                              critical
                                ? "bg-red-500/10 text-red-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            <ShieldAlert size={15} />
                          </div>

                          <div className="min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[7px] font-black uppercase tracking-[.12em] ${
                                  critical
                                    ? "text-red-500"
                                    : "text-amber-500"
                                }`}
                              >
                                {incident.severity}
                              </span>

                              <span className="text-[7px] text-slate-400">
                                #{incident.id}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-[10px] font-black">
                              {incident.title ||
                                `Asset ${incident.assetId} alert`}
                            </p>

                            <p className="mt-1 truncate text-[8px] text-slate-400">
                              {incident.asset?.name ||
                                `Asset ${incident.assetId}`}
                              {incident.asset?.location
                                ? ` · ${incident.asset.location}`
                                : ""}
                            </p>

                            <p className="mt-2 text-[7px] font-semibold text-slate-400">
                              {new Date(
                                incident.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/incidents");
                  }}
                  className={`flex w-full items-center justify-center border-t px-5 py-4 text-[9px] font-black text-[#1358e8] transition ${
                    theme === "dark"
                      ? "border-slate-800 hover:bg-white/[.04]"
                      : "border-slate-100 hover:bg-blue-50"
                  }`}
                >
                  View Incident Command
                </button>
              </div>
            )}
          </div>

          <div className="relative hidden sm:block">
            <button
              onClick={() =>
                setProfileOpen((current) => !current)
              }
              className={`flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 transition ${
                theme === "dark"
                  ? "bg-slate-900 hover:bg-slate-800"
                  : "bg-[#edf3ff] hover:bg-blue-100"
              }`}
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1358e8] text-[9px] font-black text-white">
                {initials || "AG"}
              </div>

              <div className="text-left">
                <p className="max-w-[110px] truncate text-[10px] font-black">
                  {name}
                </p>
                <p className="text-[8px] font-semibold text-slate-400">
                  {role}
                </p>
              </div>
            </button>

            {profileOpen && (
              <div className={`absolute right-0 top-[52px] w-[210px] overflow-hidden rounded-[18px] border shadow-[0_20px_60px_rgba(15,23,42,.14)] ${
                theme === "dark"
                  ? "border-slate-700 bg-[#0b1424]"
                  : "border-slate-200 bg-white"
              }`}>
                <div className="border-b border-slate-100 p-4">
                  <p className="truncate text-[11px] font-black">
                    {name}
                  </p>

                  <p className="mt-1 truncate text-[9px] text-slate-400">
                    {user.email}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[.1em] text-[#1358e8]">
                    {role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-3.5 text-left text-[10px] font-bold text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              setMobileOpen((current) => !current)
            }
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 xl:hidden"
          >
            {mobileOpen ? (
              <X size={17} />
            ) : (
              <Menu size={17} />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET NAV */}
      {mobileOpen && (
        <div
          className={`border-t px-5 py-4 xl:hidden ${
            theme === "dark"
              ? "border-slate-800 bg-[#07101f]"
              : "border-slate-100 bg-white"
          }`}
        >
          <div className="mx-auto max-w-[1500px] space-y-1">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-[11px] font-bold ${
                      isActive
                        ? "bg-[#edf3ff] text-[#1358e8]"
                        : "text-slate-500"
                    }`
                  }
                >
                  <Icon size={15} />
                  {item.label}
                </NavLink>
              );
            })}

            <button
              onClick={logout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[11px] font-bold text-red-500"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
