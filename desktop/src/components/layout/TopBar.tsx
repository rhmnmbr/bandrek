import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Navigation20Regular,
  Search16Regular,
  PlugDisconnected16Regular,
  Database16Regular,
  Color16Regular,
  ArrowExit16Regular,
} from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { useLogout } from '@/data/hooks/useAuth';

export interface TopBarProps {
  title: string;
  onToggleRail: () => void;
  onQuickSearch: () => void;
  onNewKegiatan?: () => void;
  isOffline?: boolean;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  onToggleRail,
  onQuickSearch,
  isOffline = false,
  className,
}) => {
  const logoutMutation = useLogout();

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-12 w-full flex-none items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3 select-none',
        className
      )}
    >
      {/* Rail Toggle Button */}
      <button
        type="button"
        onClick={onToggleRail}
        title="Bilah navigasi (Ctrl+B)"
        className="flex h-6.5 w-7 items-center justify-center rounded border border-(--color-border-strong) bg-white text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) cursor-pointer transition-colors"
      >
        <Navigation20Regular className="text-[14px]" />
      </button>

      {/* Screen Title */}
      <h1 className="text-[20px] font-semibold text-(--color-text) leading-normal py-1 truncate">
        {title}
      </h1>

      {/* Flexible Spacer */}
      <div className="flex-1" />

      {/* Quick Search Button (Ctrl+K) */}
      <button
        type="button"
        onClick={onQuickSearch}
        title="Pencarian cepat (Ctrl+K)"
        className="flex h-7 w-64 md:w-75 items-center gap-2 rounded border border-(--color-border-strong) bg-white px-2.5 text-[13px] text-(--color-text-secondary) transition-colors hover:border-(--color-text-muted) cursor-pointer"
      >
        <Search16Regular className="text-[14px] flex-none text-(--color-text-muted)" />
        <span className="flex-1 text-left truncate text-(--color-text-secondary)">
          Cari siswa, subjek, kegiatan
        </span>
        <kbd className="font-mono text-[10.5px] rounded border border-(--color-border-subtle) bg-(--color-surface-alt) px-1.5 py-0.5 text-(--color-text-muted) leading-none">
          Ctrl K
        </kbd>
      </button>

      {/* Offline Status Indicator */}
      {isOffline && (
        <div className="flex items-center gap-1 rounded border border-(--color-border-strong) bg-(--color-surface-sunken) px-2 py-0.5 text-[11px] font-medium text-(--color-text) shadow-xs">
          <PlugDisconnected16Regular className="text-[13px] text-(--color-text-secondary)" />
          <span>Mode Baca</span>
        </div>
      )}

      {/* Flexible Spacer */}
      <div className="flex-1" />

      {/* Quick Navigation to Dev Utilities (/data and /katalog) */}
      <div className="hidden lg:flex items-center gap-1 border-r border-(--color-border-subtle) pr-2 mr-1">
        <Link
          to="/data"
          title="Buka panel simulasi data layer (/data)"
          className="flex h-7 items-center gap-1 rounded px-2 text-[12px] font-medium text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) transition-colors"
        >
          <Database16Regular className="text-[13px]" />
          <span>Data Mock</span>
        </Link>
        <Link
          to="/katalog"
          title="Buka katalog komponen UI (/katalog)"
          className="flex h-7 items-center gap-1 rounded px-2 text-[12px] font-medium text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) transition-colors"
        >
          <Color16Regular className="text-[13px]" />
          <span>Katalog</span>
        </Link>
      </div>

      {/* Logout Action Button at Top Right Corner */}
      <Link
        to="/login"
        onClick={() => logoutMutation.mutate()}
        title="Keluar dari akun (Logout)"
        className="flex h-7.5 items-center gap-1.5 rounded border border-(--color-border-strong) bg-white px-2.5 text-[12px] font-medium text-(--color-text-secondary) hover:border-[#C50F1F] hover:text-[#C50F1F] hover:bg-[#FDE7E9] transition-colors cursor-pointer shadow-xs select-none"
      >
        <ArrowExit16Regular className="text-[13px]" />
        <span>Keluar</span>
      </Link>
    </header>
  );
};
