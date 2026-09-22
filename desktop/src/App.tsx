import { Routes, Route } from "react-router-dom";
import { Calendar24Regular } from "@fluentui/react-icons";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-canvas)] text-[var(--color-text)]">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white">
                <Calendar24Regular />
              </div>
              <h1 className="text-xl font-semibold">Bandrek</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Aplikasi Desktop Pencatatan Kegiatan Bimbel
              </p>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                Phase 1 — Scaffold Complete
              </span>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
