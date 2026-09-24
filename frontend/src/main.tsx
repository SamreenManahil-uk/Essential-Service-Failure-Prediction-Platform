import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./theme/ThemeContext";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={7000}
      />
    </ThemeProvider>
  </StrictMode>
);
