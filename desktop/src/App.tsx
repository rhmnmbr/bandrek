import * as React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast";
import { KatalogScreen } from "@/screens/KatalogScreen";
import { Button } from "@/components/ui/button";

export default function App() {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enable developer reload in Tauri desktop window
      if (e.key === "F5" || (e.ctrlKey && e.key.toLowerCase() === "r")) {
        e.preventDefault();
        window.location.reload();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <ToastProvider>
      <Routes>
        <Route path="/katalog" element={<KatalogScreen />} />
        <Route
          path="/"
          element={
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-[var(--color-canvas)] text-[var(--color-text)] p-6">
              <div className="flex flex-col items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-raised)] max-w-[460px] text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand)] text-white text-[22px] font-bold">
                  B
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-[var(--color-text)]">
                    Bandrek Desktop
                  </h1>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                    Aplikasi Desktop Pencatatan Kegiatan Bimbel
                  </p>
                </div>

                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border-subtle)] text-[12px] text-[var(--color-text-muted)] w-full text-left space-y-1">
                  <div className="font-semibold text-[var(--color-text)]">Status Pengembangan:</div>
                  <div>• Phase 1: Scaffold (Tauri 2 + React 19 + Vite 8) — Selesai</div>
                  <div>• Phase 2: Tokens &amp; Component Catalog — Siap Ditinjau</div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link to="/katalog">
                    <Button variant="primary">
                      Buka Katalog Komponen (/katalog)
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </ToastProvider>
  );
}
