import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 menit: cache tetap segar untuk navigasi instan antar menu
      gcTime: 15 * 60 * 1000,   // 15 menit retensi memori
      refetchOnWindowFocus: false, // Cegah refetch berulang saat aplikasi desktop fokus/berpindah jendela
    },
  },
});

// Dismiss splash screen with minimum 1.2s duration to prevent abrupt disappearance
const splashStartTime = Date.now();
const MIN_SPLASH_MS = 1200;

function dismissSplash() {
  const splashEl = document.getElementById("app-splash");
  if (!splashEl) return;

  const elapsed = Date.now() - splashStartTime;
  const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

  setTimeout(() => {
    splashEl.classList.add("fade-out");
    setTimeout(() => {
      splashEl.remove();
    }, 400);
  }, remaining);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

dismissSplash();

// Nonaktifkan native web context menu di seluruh aplikasi desktop
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});
