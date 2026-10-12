import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  CalendarLtr20Regular,
  CalendarLtr20Filled,
  DocumentBulletList20Regular,
  DocumentBulletList20Filled,
  Table20Regular,
  Table20Filled,
  Person20Regular,
  Person20Filled,
  PersonBoard20Regular,
  PersonBoard20Filled,
  Book20Regular,
  Book20Filled,
  PeopleCommunity20Regular,
  PeopleCommunity20Filled,
  Building20Regular,
  Building20Filled,
  Tag20Regular,
  Tag20Filled,
  PersonSettings20Regular,
  PersonSettings20Filled,
  Warning16Regular,
  LockClosed16Regular,
  ArrowExit16Regular,
} from '@fluentui/react-icons';
import { usePerluRealisasiCount } from '@/data/hooks';
import { useAuthSession, useLogout } from '@/data/hooks/useAuth';
import { BandrekLogo, BandrekCupIcon } from '@/components/ui/bandrek-logo';
import { UbahKataSandiModal } from './UbahKataSandiModal';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface NavigationRailProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

interface NavItemConfig {
  to: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/kalender',
    label: 'Kalender',
    shortcut: 'Alt+1',
    icon: <CalendarLtr20Regular />,
    activeIcon: <CalendarLtr20Filled />,
  },
  {
    to: '/kegiatan',
    label: 'Kegiatan',
    shortcut: 'Alt+2',
    icon: <DocumentBulletList20Regular />,
    activeIcon: <DocumentBulletList20Filled />,
  },
  {
    to: '/matriks',
    label: 'Matriks belajar',
    shortcut: 'Alt+3',
    icon: <Table20Regular />,
    activeIcon: <Table20Filled />,
  },
];

const MASTER_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/master/siswa',
    label: 'Siswa',
    shortcut: 'Alt+4',
    icon: <Person20Regular />,
    activeIcon: <Person20Filled />,
  },
  {
    to: '/master/subjek',
    label: 'Subjek',
    shortcut: 'Alt+5',
    icon: <PersonBoard20Regular />,
    activeIcon: <PersonBoard20Filled />,
  },
  {
    to: '/master/mapel',
    label: 'Mata pelajaran',
    shortcut: 'Alt+6',
    icon: <Book20Regular />,
    activeIcon: <Book20Filled />,
  },
  {
    to: '/master/kelas',
    label: 'Kelas',
    shortcut: 'Alt+7',
    icon: <PeopleCommunity20Regular />,
    activeIcon: <PeopleCommunity20Filled />,
  },
  {
    to: '/master/tempat',
    label: 'Tempat',
    shortcut: 'Alt+8',
    icon: <Building20Regular />,
    activeIcon: <Building20Filled />,
  },
  {
    to: '/master/jenis',
    label: 'Jenis kegiatan',
    shortcut: 'Alt+9',
    icon: <Tag20Regular />,
    activeIcon: <Tag20Filled />,
  },
];

const SETTINGS_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/pengaturan/pengguna',
    label: 'Pengguna',
    shortcut: 'Alt+0',
    icon: <PersonSettings20Regular />,
    activeIcon: <PersonSettings20Filled />,
  },
];

export const NavigationRail: React.FC<NavigationRailProps> = ({
  collapsed,
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: perluCount = 0 } = usePerluRealisasiCount();
  const { data: session } = useAuthSession();
  const logoutMutation = useLogout();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isAdmin = session?.user?.peran === 'admin';
  const userName = session?.user?.nama || 'Administrator';
  const userInitials = (session?.user?.nama ? session.user.nama.slice(0, 2) : 'AD').toUpperCase();

  const isPerluActive =
    location.pathname === '/kegiatan' &&
    new URLSearchParams(location.search).get('filter') === 'perlu_realisasi';

  const renderItem = (item: NavItemConfig) => {
    return (
      <NavLink
        key={item.to}
        to={item.to}
        title={`${item.label} · ${item.shortcut}`}
        className={({ isActive }) => {
          const active = isActive && !isPerluActive;
          return cn(
            'group relative flex h-8.5 w-full items-center rounded-md text-[13.5px] font-medium transition-colors duration-(--dur-fast) cursor-pointer select-none px-0.5 gap-2 overflow-hidden',
            active
              ? 'bg-(--color-brand-subtle) text-(--color-brand-ink)'
              : 'text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text)'
          );
        }}
      >
        {({ isActive }) => {
          const active = isActive && !isPerluActive;
          return (
            <>
              <span className="flex h-7.5 w-7.5 flex-none items-center justify-center text-[18px]">
                {active ? item.activeIcon : item.icon}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap flex-none text-[13.5px] leading-normal py-0.5 transition-opacity duration-150 ease-in-out',
                  collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                )}
              >
                {item.label}
              </span>
            </>
          );
        }}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 flex h-screen flex-col border-r border-(--color-border) bg-(--color-surface) py-2 px-1.5 select-none transition-[width] duration-200 ease-in-out overflow-hidden shrink-0',
        collapsed ? 'w-12' : 'w-52',
        className
      )}
      aria-label="Navigasi Utama"
    >
      {/* Brand Header */}
      <div className="relative flex h-12 items-center mb-1 overflow-hidden">
        {/* Expanded: Full horizontal logo SVG (bukan teks hardcoded) */}
        <div
          className={cn(
            'flex items-center w-full px-1 transition-opacity duration-150 ease-in-out',
            collapsed ? 'opacity-0 pointer-events-none absolute left-0' : 'opacity-100'
          )}
          title="Bandrek - Bandung Remaja Intelek"
        >
          <BandrekLogo className="h-10 w-auto max-w-full text-[#4D5962]" />
        </div>

        {/* Collapsed: Standalone cup icon SVG */}
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center mx-auto transition-opacity duration-150 ease-in-out',
            collapsed ? 'opacity-100' : 'opacity-0 pointer-events-none absolute left-1'
          )}
          title="Bandrek"
        >
          <BandrekCupIcon className="w-7 h-7 text-[#4D5962]" />
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="flex flex-col gap-0.5">
        {PRIMARY_NAV_ITEMS.map(renderItem)}

        {/* Separator */}
        <div className="my-1.5 h-px bg-(--color-border-subtle)" />

        {/* Master Data Items */}
        {MASTER_NAV_ITEMS.map(renderItem)}

        {/* Separator */}
        <div className="my-1.5 h-px bg-(--color-border-subtle)" />

        {/* Pengaturan / Pengguna Items */}
        {SETTINGS_NAV_ITEMS.map(renderItem)}
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
            'group relative mb-2 flex h-8.5 w-full items-center rounded border border-[#F0A82E] bg-[#FFF3E0] text-[#8A5200] transition-colors duration-(--dur-fast) cursor-pointer select-none hover:bg-[#FFF8EE] px-1 gap-1',
            isPerluActive && 'ring-2 ring-(--color-focus-ring) ring-offset-1 font-semibold'
          )}
        >
          <span className="relative flex h-7.5 w-6 flex-none items-center justify-center text-[13px]">
            <Warning16Regular className="text-[#C47D00]" />
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C50F1F] px-1 text-[9px] font-bold text-white border border-[#FFF3E0] shadow-xs transition-opacity duration-150 ease-in-out',
                collapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              {perluCount}
            </span>
          </span>
          <span
            className={cn(
              'flex-1 min-w-0 text-left text-[12.5px] font-medium leading-normal py-0.5 whitespace-nowrap truncate transition-opacity duration-150 ease-in-out',
              collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            )}
          >
            Perlu realisasi
          </span>
          <span
            className={cn(
              'flex h-4.5 min-w-4.5 flex-none items-center justify-center rounded-full bg-[#C50F1F] px-1.5 text-[10px] font-bold text-white shadow-xs mr-1 transition-opacity duration-150 ease-in-out',
              collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            )}
          >
            {perluCount}
          </span>
        </button>
      )}

      {/* User Session Profile Card at Bottom (Pojok Kiri Bawah) */}
      <div className="flex items-center border-t border-(--color-border-subtle) pt-2 mt-auto">
        <Popover open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title={`Akun: ${userName} (${isAdmin ? 'Administrator' : 'Operator'})`}
              className={cn(
                'group flex h-10 items-center select-none w-full gap-2 px-0.5 rounded text-left transition-colors cursor-pointer border-none bg-transparent',
                'hover:bg-(--color-surface-alt) active:bg-(--color-surface-sunken)',
                isProfileMenuOpen && 'bg-(--color-surface-alt)'
              )}
            >
              <span
                className={cn(
                  'flex h-7.5 w-7.5 flex-none items-center justify-center rounded-full text-[11px] font-bold border transition-all',
                  isAdmin
                    ? 'bg-[#F3EFFA] text-[#5B4394] border-[#D3C8E8]'
                    : 'bg-[#EBF3FC] text-[#0C548F] border-[#C5DCFA]'
                )}
              >
                {userInitials}
              </span>
              <div
                className={cn(
                  'flex flex-col justify-center whitespace-nowrap min-w-0 flex-1 transition-opacity duration-150 ease-in-out',
                  collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                )}
              >
                <span className="truncate text-[12.5px] font-medium text-(--color-text) leading-[16px]">
                  {userName}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider leading-[13px] mt-0.5',
                    isAdmin ? 'text-[#5B4394]' : 'text-[#0C548F]'
                  )}
                >
                  {isAdmin ? 'Administrator' : 'Operator'}
                </span>
              </div>
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-56 p-1 rounded-lg border border-(--color-border-strong) bg-(--color-surface) shadow-xl select-none"
          >
            <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-b border-(--color-border-subtle) mb-1">
              <span className="text-[13px] font-semibold text-(--color-text-primary) truncate">
                {userName}
              </span>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold border',
                  isAdmin
                    ? 'border-[#8764B8] bg-[#F3EFFA] text-[#5B4394]'
                    : 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand)'
                )}
              >
                {isAdmin ? 'Admin' : 'Operator'}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsChangePasswordOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-[12.5px] text-(--color-text-primary) hover:bg-(--color-surface-alt) hover:text-(--color-brand) transition-colors cursor-pointer border-none bg-transparent text-left"
              >
                <LockClosed16Regular className="w-4 h-4 text-(--color-text-muted)" />
                <span>Ubah kata sandi</span>
              </button>

              <div className="my-1 h-px bg-(--color-border-subtle)" />

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logoutMutation.mutate();
                  navigate('/login');
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-[12.5px] text-(--color-danger) hover:bg-(--color-danger-subtle) transition-colors cursor-pointer border-none bg-transparent text-left"
              >
                <ArrowExit16Regular className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Modal Ubah Kata Sandi */}
      <UbahKataSandiModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </aside>
  );
};
