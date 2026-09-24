import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import type { AuthUser } from "./auth/types";
import LoginPage from "./pages/LoginPage";
import CommandCenter from "./pages/CommandCenter";
import AssetsPage from "./pages/AssetsPage";
import IntelligencePage from "./pages/IntelligencePage";
import IncidentsPage from "./pages/IncidentsPage";
import LiveNetworkPage from "./pages/LiveNetworkPage";

function getStoredUser(): AuthUser | null {
  try {
    const token = localStorage.getItem("aegis-token");
    const stored = localStorage.getItem("aegis-user");

    if (!token || !stored) {
      return null;
    }

    const user = JSON.parse(stored) as AuthUser;

    if (
      user.expiresAt &&
      new Date(user.expiresAt) <= new Date()
    ) {
      localStorage.removeItem("aegis-token");
      localStorage.removeItem("aegis-user");
      return null;
    }

    return user;
  } catch {
    localStorage.removeItem("aegis-token");
    localStorage.removeItem("aegis-user");
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(
    getStoredUser()
  );

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/live" element={<LiveNetworkPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
