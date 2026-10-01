import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const BANDREK_EVENTS = {
  NEW_KEGIATAN: 'bandrek:new-kegiatan',
  SAVE: 'bandrek:save',
  TOGGLE_RAIL: 'bandrek:toggle-rail',
  QUICK_SEARCH: 'bandrek:quick-search',
  ESC_PRESSED: 'bandrek:esc-pressed',
  SIDE_PANEL_STATE_CHANGE: 'bandrek:side-panel-change',
} as const;

export interface KeyboardShortcutHandlers {
  onNewKegiatan?: () => void;
  onSave?: () => void;
  onToggleRail?: () => void;
  onQuickSearch?: () => void;
  onEsc?: () => void;
}

export function dispatchBandrekEvent(eventName: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Global Keyboard Shortcuts Hook
 * Handles Ctrl+N, Ctrl+S, Esc, Ctrl+B, Ctrl+K, Alt+1..9
 * per DESIGN.md §7 & DOMAIN.md
 */
export function useGlobalKeyboardShortcuts(handlers?: KeyboardShortcutHandlers) {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Reload window for Tauri desktop
      if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        window.location.reload();
        return;
      }

      // 2. Ctrl+S: Save active form / draft (always allowed, even inside inputs)
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (handlers?.onSave) {
          handlers.onSave();
        } else {
          dispatchBandrekEvent(BANDREK_EVENTS.SAVE);
        }
        return;
      }

      // 3. Ctrl+N: New kegiatan (always allowed)
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (handlers?.onNewKegiatan) {
          handlers.onNewKegiatan();
        } else {
          dispatchBandrekEvent(BANDREK_EVENTS.NEW_KEGIATAN);
        }
        return;
      }

      // 4. Ctrl+B: Toggle navigation rail
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (handlers?.onToggleRail) {
          handlers.onToggleRail();
        } else {
          dispatchBandrekEvent(BANDREK_EVENTS.TOGGLE_RAIL);
        }
        return;
      }

      // 5. Ctrl+K: Quick search modal
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (handlers?.onQuickSearch) {
          handlers.onQuickSearch();
        } else {
          dispatchBandrekEvent(BANDREK_EVENTS.QUICK_SEARCH);
        }
        return;
      }

      // 6. Esc: Close active modal / panel / dialog
      if (e.key === 'Escape') {
        if (handlers?.onEsc) {
          handlers.onEsc();
        } else {
          dispatchBandrekEvent(BANDREK_EVENTS.ESC_PRESSED);
        }
        return;
      }

      // 7. Alt+1..9: Navigation rail fast jump (ignore if inside input with modifier)
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            navigate('/kalender');
            break;
          case '2':
            e.preventDefault();
            navigate('/kegiatan');
            break;
          case '3':
            e.preventDefault();
            navigate('/matriks');
            break;
          case '4':
            e.preventDefault();
            navigate('/master/siswa');
            break;
          case '5':
            e.preventDefault();
            navigate('/master/subjek');
            break;
          case '6':
            e.preventDefault();
            navigate('/master/mapel');
            break;
          case '7':
            e.preventDefault();
            navigate('/master/kelas');
            break;
          case '8':
            e.preventDefault();
            navigate('/master/tempat');
            break;
          case '9':
            e.preventDefault();
            navigate('/master/jenis');
            break;
          case '0':
            e.preventDefault();
            navigate('/pengaturan/pengguna');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, handlers]);
}
