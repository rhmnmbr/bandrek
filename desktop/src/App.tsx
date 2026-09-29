import * as React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast";
import { KatalogScreen } from "@/screens/KatalogScreen";
import { Button } from "@/components/ui/button";

import { DataLayerScreen } from "@/screens/DataLayerScreen";

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
        <Route path="/data" element={<DataLayerScreen />} />
        <Route
          path="/"
          element={
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-(--color-canvas) text-(--color-text) p-6">
              <div className="flex flex-col items-center gap-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-8 shadow-(--shadow-raised) max-w-115 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-brand) text-white text-[22px] font-bold">
                  B
                </div>
                <div>
                  <h1 className="text-[20px] font-semibold text-(--color-text)">
                    Bandrek Desktop
                  </h1>
                  <p className="text-[13px] text-(--color-text-secondary) mt-1">
                    Aplikasi Desktop Pencatatan Kegiatan Bimbel
                  </p>
                </div>

                <div className="p-3 rounded-md bg-(--color-surface-alt) border border-(--color-border-subtle) text-[12px] text-(--color-text-muted) w-full text-left space-y-1">
                  <div className="font-semibold text-(--color-text)">Status Pengembangan:</div>
                  <div>• Phase 1: Scaffold (Tauri 2 + React 19 + Vite 8) — Selesai</div>
                  <div>• Phase 2: Tokens &amp; Component Catalog — Selesai</div>
                  <div>• Phase 3: Data Layer &amp; Mock (TanStack Query) — Siap Ditinjau</div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link to="/data">
                    <Button variant="primary">
                      Uji Data Layer &amp; Mock (/data)
                    </Button>
                  </Link>
                  <Link to="/katalog">
                    <Button variant="secondary">
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
