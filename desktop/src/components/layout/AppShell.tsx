import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavigationRail } from './NavigationRail';
import { TopBar } from './TopBar';
import { QuickSearchModal } from './QuickSearchModal';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { useToast } from '@/components/ui/toast';
import { useSimulasi } from '@/data/hooks';
import {
  useGlobalKeyboardShortcuts,
  BANDREK_EVENTS,
  dispatchBandrekEvent,
} from '@/lib/keyboardShortcuts';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { showToast, setOffsetRight } = useToast();
  const { config, updateConfig } = useSimulasi();

  // Rail collapse state with persistence
  const [railCollapsed, setRailCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem('bandrek:rail-collapsed') === 'true';
  });

  const toggleRail = React.useCallback(() => {
    setRailCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('bandrek:rail-collapsed', String(next));
      return next;
    });
  }, []);

  // Quick search modal state
  const [quickSearchOpen, setQuickSearchOpen] = React.useState(false);
  const [isRetryingConnection, setIsRetryingConnection] = React.useState(false);

  // Derive offline state
  const isOffline = config.offlineBannerVisible || config.errorType === 'offline';

  // Dynamic route titles per prototype & DOMAIN.md
  const getScreenTitle = (pathname: string, search: string): string => {
    if (pathname === '/kalender' || pathname === '/') return 'Kalender';
    if (pathname === '/kegiatan') {
      const filter = new URLSearchParams(search).get('filter');
      return filter === 'perlu_realisasi' ? 'Kegiatan Perlu Realisasi' : 'Daftar kegiatan';
    }
    if (pathname.startsWith('/kegiatan/')) return 'Kegiatan';
    if (pathname === '/matriks') return 'Matriks belajar';
    if (pathname === '/master/siswa') return 'Siswa';
    if (pathname === '/master/subjek') return 'Subjek';
    if (pathname === '/master/mapel') return 'Mata pelajaran & materi';
    if (pathname === '/master/kelas') return 'Kelas';
    if (pathname === '/master/tempat') return 'Tempat & ruangan';
    if (pathname === '/master/jenis') return 'Jenis kegiatan';
    if (pathname === '/data') return 'Simulasi Data Layer & Mock';
    if (pathname === '/katalog') return 'Katalog Komponen';
    return 'Bandrek';
  };

  const title = getScreenTitle(location.pathname, location.search);

  // Handle + Kegiatan baru (Ctrl+N)
  const handleNewKegiatan = React.useCallback(() => {
    dispatchBandrekEvent(BANDREK_EVENTS.NEW_KEGIATAN);
    showToast({
      message: 'Membuka form kegiatan baru (A4)...',
      type: 'info',
    });
  }, [showToast]);

  // Handle Save (Ctrl+S)
  const handleSave = React.useCallback(() => {
    dispatchBandrekEvent(BANDREK_EVENTS.SAVE);
    showToast({
      message: 'Perubahan disimpan (Ctrl+S).',
      type: 'success',
    });
  }, [showToast]);

  // Handle Esc
  const handleEsc = React.useCallback(() => {
    if (quickSearchOpen) {
      setQuickSearchOpen(false);
      return;
    }
    dispatchBandrekEvent(BANDREK_EVENTS.ESC_PRESSED);
  }, [quickSearchOpen]);

  // Register global keyboard shortcuts
  useGlobalKeyboardShortcuts({
    onNewKegiatan: handleNewKegiatan,
    onSave: handleSave,
    onToggleRail: toggleRail,
    onQuickSearch: () => setQuickSearchOpen(true),
    onEsc: handleEsc,
  });

  // Listen to side-panel open/close events to adjust toast offset per DESIGN.md §3.8 & §14
  React.useEffect(() => {
    const handlePanelChange = (e: CustomEvent<{ isOpen: boolean; width?: number }>) => {
      if (e.detail?.isOpen) {
        setOffsetRight(e.detail.width ? e.detail.width + 16 : 514);
      } else {
        setOffsetRight(16);
      }
    };

    window.addEventListener(
      'bandrek:side-panel-change',
      handlePanelChange as EventListener
    );
    return () => {
      window.removeEventListener(
        'bandrek:side-panel-change',
        handlePanelChange as EventListener
      );
    };
  }, [setOffsetRight]);

  // Offline retry handler
  const handleRetryConnection = React.useCallback(() => {
    setIsRetryingConnection(true);
    setTimeout(() => {
      setIsRetryingConnection(false);
      updateConfig({
        offlineBannerVisible: false,
        errorType: 'none',
        lastSyncedAt: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      showToast({
        message: 'Tersambung kembali ke server.',
        type: 'success',
      });
    }, 1200);
  }, [updateConfig, showToast]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-(--color-canvas) text-(--color-text) select-none">
      {/* Navigation Rail */}
      <NavigationRail
        collapsed={railCollapsed}
        onToggleCollapse={toggleRail}
      />

      {/* Main Layout Column */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <TopBar
          title={title}
          onToggleRail={toggleRail}
          onQuickSearch={() => setQuickSearchOpen(true)}
          onNewKegiatan={handleNewKegiatan}
          isOffline={isOffline}
        />

        {/* Sticky Offline Banner Infrastructure */}
        {isOffline && (
          <OfflineBanner
            cachedAt={config.lastSyncedAt}
            isRetrying={isRetryingConnection}
            onRetry={handleRetryConnection}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 min-h-0 overflow-auto relative bg-(--color-canvas)">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Search Modal (Ctrl+K) */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
      />
    </div>
  );
};
