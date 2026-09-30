import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Navigation20Regular,
  Search16Regular,
  Add16Regular,
  PlugDisconnected16Regular,
  Database16Regular,
  Color16Regular,
  ArrowExit16Regular,
} from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { useAuthSession, useLogout } from '@/data/hooks/useAuth';

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
  onNewKegiatan,
  isOffline = false,
  className,
}) => {
  const { data: session } = useAuthSession();
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
      <h1 className="text-[20px] font-semibold text-(--color-text) leading-tight truncate">
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
        <div className="flex items-center gap-1 rounded bg-[#2D2C2B] px-2 py-1 text-[11px] font-medium text-[#F3F2F1] shadow-xs">
          <PlugDisconnected16Regular className="text-[13px] text-[#F3F2F1]" />
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
          className="flex h-7 items-center gap-1 rounded px-2 text-[12px] text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) transition-colors"
        >
          <Database16Regular className="text-[13px]" />
          <span>Data Mock</span>
        </Link>
        <Link
          to="/katalog"
          title="Buka katalog komponen UI (/katalog)"
          className="flex h-7 items-center gap-1 rounded px-2 text-[12px] text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text) transition-colors"
        >
          <Color16Regular className="text-[13px]" />
          <span>Katalog</span>
        </Link>
      </div>

      {/* User Session & Role */}
      {session?.user && (
        <div className="flex items-center gap-1.5 border-r border-(--color-border-subtle) pr-2 mr-1">
          {session.user.peran === 'admin' ? (
            <Link
              to="/pengaturan/pengguna"
              title={`Akun: ${session.user.nama} (${session.user.peran}) · Klik untuk buka Manajemen Pengguna`}
              className="flex h-7 items-center gap-1.5 rounded px-1.5 text-[12px] hover:bg-(--color-surface-alt) text-(--color-text-primary) transition-colors"
            >
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#F3EFFA] text-[10px] font-bold text-[#5B4394] border border-[#D3C8E8]">
                {session.user.nama.slice(0, 2).toUpperCase()}
              </span>
              <span className="hidden sm:inline font-medium max-w-[100px] truncate text-[12px]">
                {session.user.nama.split(' ')[0]}
              </span>
              <span className="rounded bg-[#F3EFFA] px-1 py-0.2 text-[9.5px] font-bold text-[#5B4394] uppercase tracking-wider">
                Admin
              </span>
            </Link>
          ) : (
            <div
              title={`Akun: ${session.user.nama} (${session.user.peran})`}
              className="flex h-7 items-center gap-1.5 rounded px-1.5 text-[12px] text-(--color-text-primary)"
            >
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#EBF3FC] text-[10px] font-bold text-[#0C548F] border border-[#C5DCFA]">
                {session.user.nama.slice(0, 2).toUpperCase()}
              </span>
              <span className="hidden sm:inline font-medium max-w-[100px] truncate text-[12px]">
                {session.user.nama.split(' ')[0]}
              </span>
              <span className="rounded bg-[#EBF3FC] px-1 py-0.2 text-[9.5px] font-bold text-[#0C548F] uppercase tracking-wider">
                Operator
              </span>
            </div>
          )}

          <Link
            to="/login"
            onClick={() => logoutMutation.mutate()}
            title="Keluar / Ganti Akun"
            className="flex h-6 w-6 items-center justify-center rounded text-(--color-text-muted) hover:text-[#C50F1F] hover:bg-[#FDE7E9] transition-colors cursor-pointer"
          >
            <ArrowExit16Regular className="text-[13px]" />
          </Link>
        </div>
      )}

      {/* Primary Action Button: + Kegiatan baru (Ctrl+N) */}
      <button
        type="button"
        onClick={onNewKegiatan}
        title="Buat kegiatan baru (Ctrl+N)"
        className="flex h-7.5 items-center gap-1.5 rounded bg-(--color-brand) px-3 text-[13px] font-semibold text-white transition-colors duration-(--dur-fast) hover:bg-(--color-brand-pressed) active:translate-y-px cursor-pointer shadow-xs"
      >
        <Add16Regular className="text-[14px] stroke-2" />
        <span>Kegiatan baru</span>
      </button>
    </header>
  );
};
