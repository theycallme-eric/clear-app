import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { AppErrorFallback } from "./components/AppErrorFallback";
import { initTheme } from "./lib/theme";
import "./index.css";
import "./transitions.css";

initTheme();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary fallbackRender={AppErrorFallback}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
