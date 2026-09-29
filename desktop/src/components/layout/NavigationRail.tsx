import * as React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  CalendarLtr20Regular,
  DocumentBulletList20Regular,
  Table20Regular,
  Person20Regular,
  PersonBoard20Regular,
  BookOpen20Regular,
  PeopleCommunity20Regular,
  Building20Regular,
  Tag20Regular,
  Warning16Regular,
  Navigation20Regular,
} from '@fluentui/react-icons';
import { usePerluRealisasiCount } from '@/data/hooks';

export interface NavigationRailProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

interface NavItemConfig {
  to: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/kalender',
    label: 'Kalender',
    shortcut: 'Alt+1',
    icon: <CalendarLtr20Regular className="text-[17px]" />,
  },
  {
    to: '/kegiatan',
    label: 'Kegiatan',
    shortcut: 'Alt+2',
    icon: <DocumentBulletList20Regular className="text-[17px]" />,
  },
  {
    to: '/matriks',
    label: 'Matriks belajar',
    shortcut: 'Alt+3',
    icon: <Table20Regular className="text-[17px]" />,
  },
];

const MASTER_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/master/siswa',
    label: 'Siswa',
    shortcut: 'Alt+4',
    icon: <Person20Regular className="text-[17px]" />,
  },
  {
    to: '/master/subjek',
    label: 'Subjek',
    shortcut: 'Alt+5',
    icon: <PersonBoard20Regular className="text-[17px]" />,
  },
  {
    to: '/master/mapel',
    label: 'Mata pelajaran',
    shortcut: 'Alt+6',
    icon: <BookOpen20Regular className="text-[17px]" />,
  },
  {
    to: '/master/kelas',
    label: 'Kelas',
    shortcut: 'Alt+7',
    icon: <PeopleCommunity20Regular className="text-[17px]" />,
  },
  {
    to: '/master/tempat',
    label: 'Tempat',
    shortcut: 'Alt+8',
    icon: <Building20Regular className="text-[17px]" />,
  },
  {
    to: '/master/jenis',
    label: 'Jenis kegiatan',
    shortcut: 'Alt+9',
    icon: <Tag20Regular className="text-[17px]" />,
  },
];

export const NavigationRail: React.FC<NavigationRailProps> = ({
  collapsed,
  onToggleCollapse,
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: perluCount = 0 } = usePerluRealisasiCount();

  const isPerluActive =
    location.pathname === '/kegiatan' &&
    new URLSearchParams(location.search).get('filter') === 'perlu_realisasi';

  const renderItem = (item: NavItemConfig) => {
    return (
      <NavLink
        key={item.to}
        to={item.to}
        title={`${item.label} · ${item.shortcut}`}
        className={({ isActive }) =>
          cn(
            'group relative flex h-8.5 w-full items-center rounded text-[13.5px] font-normal transition-colors duration-(--dur-fast) cursor-pointer select-none',
            collapsed ? 'justify-center px-0' : 'gap-2 px-1.5',
            isActive && !isPerluActive
              ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-medium shadow-[inset_3px_0_0_var(--color-brand)]'
              : 'text-(--color-text) hover:bg-(--color-surface-alt)'
          )
        }
      >
        <span className="flex h-8 w-8 flex-none items-center justify-center">
          {item.icon}
        </span>
        {!collapsed && (
          <span className="truncate whitespace-nowrap leading-none transition-opacity duration-(--dur-normal)">
            {item.label}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 flex h-screen flex-col border-r border-(--color-border) bg-(--color-surface) py-2 select-none transition-[width] duration-240 ease-[cubic-bezier(.16,1,.3,1)]',
        collapsed ? 'w-12 px-1' : 'w-52 px-2',
        className
      )}
      aria-label="Navigasi Utama"
    >
      {/* Brand Header */}
      <div
        className={cn(
          'flex h-10 items-center mb-1.5',
          collapsed ? 'justify-center px-0' : 'gap-2.5 px-1'
        )}
      >
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-(--color-brand) text-white font-semibold text-[16px] shadow-xs">
          B
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-[15px] font-semibold text-(--color-text) tracking-tight leading-tight">
              Bandrek
            </span>
            <span className="text-[10px] text-(--color-text-muted) leading-none truncate">
              Bimbel Management
            </span>
          </div>
        )}
      </div>

      {/* Main Nav Items */}
      <nav className="flex flex-col gap-0.5">
        {PRIMARY_NAV_ITEMS.map(renderItem)}

        {/* Separator */}
        <div className="my-1.5 h-px bg-(--color-border-subtle)" />

        {/* Master Data Items */}
        {MASTER_NAV_ITEMS.map(renderItem)}
      </nav>

      {/* Flexible Spacer */}
      <div className="flex-1 min-h-2" />

      {/* Perlu Realisasi Badge Action Button (DOMAIN.md §11) */}
      {perluCount > 0 && (
        <button
          type="button"
          onClick={() => navigate('/kegiatan?filter=perlu_realisasi')}
          title={`Kegiatan belum direalisasi: ${perluCount} perlu tindakan`}
          className={cn(
            'group relative mb-2 flex h-8.5 w-full items-center rounded border border-[#F0A82E] bg-[#FFF3E0] text-[#8A5200] transition-colors duration-(--dur-fast) cursor-pointer select-none hover:bg-[#FFF8EE]',
            collapsed ? 'justify-center px-0' : 'gap-2 px-1.5',
            isPerluActive && 'ring-2 ring-(--color-focus-ring) ring-offset-1 font-semibold'
          )}
        >
          <span className="relative flex h-8 w-8 flex-none items-center justify-center text-[13px]">
            <Warning16Regular className="text-[#C47D00]" />
            {collapsed && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C50F1F] px-1 text-[9.5px] font-bold text-white border border-[#FFF3E0]">
                {perluCount}
              </span>
            )}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left text-[12.5px] font-medium leading-none">
                Perlu realisasi
              </span>
              <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#C50F1F] px-1.5 text-[10px] font-bold text-white shadow-xs mr-0.5">
                {perluCount}
              </span>
            </>
          )}
        </button>
      )}

      {/* Bottom Rail Collapse Hint / Toggle */}
      <div
        className={cn(
          'flex items-center border-t border-(--color-border-subtle) pt-2',
          collapsed ? 'justify-center' : 'justify-between px-1'
        )}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Perluas bilah navigasi (Ctrl+B)' : 'Ciutkan bilah navigasi (Ctrl+B)'}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-(--color-surface-alt) text-(--color-text-secondary) hover:text-(--color-text) cursor-pointer transition-colors"
        >
          <Navigation20Regular className="text-[16px]" />
        </button>
        {!collapsed && (
          <span className="text-[11px] text-(--color-text-muted) truncate">
            Ctrl+B ciutkan
          </span>
        )}
      </div>
    </aside>
  );
};
