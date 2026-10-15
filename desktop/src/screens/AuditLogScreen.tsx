import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History20Regular,
  Search24Regular,
  Person24Regular,
  Warning16Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';
import { Button } from '@/components/ui/button';
import { MultiSelect, type SelectOption } from '@/components/ui/select';
import { useAuthSession, useAuditLogs } from '@/data/hooks';
import type { AuditAksi, AuditFieldDiff } from '@/data/types/auditLog';
import { AuditLogSkeleton } from '@/components/skeleton/AuditLogSkeleton';
import { useMinimumLoading } from '@/lib/useMinimumLoading';

const KATEGORI_OPTIONS: SelectOption[] = [
  { value: 'kegiatan', label: 'Kegiatan' },
  { value: 'realisasi', label: 'Realisasi' },
  { value: 'siswa', label: 'Siswa' },
  { value: 'subjek', label: 'Subjek' },
  { value: 'master', label: 'Master Data' },
  { value: 'pengguna', label: 'Pengguna' },
  { value: 'sistem', label: 'Sistem' },
];

const AKSI_OPTIONS: SelectOption[] = [
  { value: 'buat', label: 'Buat' },
  { value: 'ubah', label: 'Ubah' },
  { value: 'hapus', label: 'Hapus' },
  { value: 'realisasi', label: 'Realisasi' },
  { value: 'login', label: 'Login' },
];

const AKSI_BADGES: Record<
  AuditAksi,
  { label: string; bg: string; text: string; border: string }
> = {
  buat: {
    label: 'Buat',
    bg: 'bg-[#E8F5E9]',
    text: 'text-[#2E7D32]',
    border: 'border-[#4CAF50]',
  },
  ubah: {
    label: 'Ubah',
    bg: 'bg-(--color-brand-subtle)',
    text: 'text-(--color-brand)',
    border: 'border-(--color-brand)',
  },
  realisasi: {
    label: 'Realisasi',
    bg: 'bg-[#FFF3E0]',
    text: 'text-[#8A5200]',
    border: 'border-[#F0A82E]',
  },
  hapus: {
    label: 'Hapus',
    bg: 'bg-(--color-danger-subtle)',
    text: 'text-(--color-danger-fg)',
    border: 'border-(--color-danger)',
  },
  login: {
    label: 'Login',
    bg: 'bg-(--color-surface-alt)',
    text: 'text-(--color-text-secondary)',
    border: 'border-(--color-border)',
  },
};

function getAksiBadge(aksi: string) {
  return (
    AKSI_BADGES[aksi as AuditAksi] || {
      label: aksi || 'Aktivitas',
      bg: 'bg-(--color-surface-alt)',
      text: 'text-(--color-text-secondary)',
      border: 'border-(--color-border)',
    }
  );
}

function formatWaktuIndo(isoString: string): string {
  try {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const tgl = d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const jam = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return `${tgl}, ${jam}`;
  } catch {
    return isoString;
  }
}

export function AuditLogScreen() {
  const navigate = useNavigate();
  const { data: session, isLoading: isSessionLoading } = useAuthSession();
  const isAdmin = session?.user?.peran === 'admin';

  const { data: auditLogs = [], isLoading } = useAuditLogs();
  const isScreenLoading = useMinimumLoading(
    (isSessionLoading || isLoading) && auditLogs.length === 0,
    350
  );
  const [cari, setCari] = useState('');
  const [filterKategori, setFilterKategori] = useState<string[]>([]);
  const [filterAksi, setFilterAksi] = useState<string[]>([]);
  const [filterOperator, setFilterOperator] = useState<string[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Filtered log entries
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((item) => {
      // Search text match
      if (cari.trim()) {
        const q = cari.toLowerCase();
        const opNama = item.operator?.nama || '';
        const opUser = item.operator?.username || '';
        const matchOperator =
          opNama.toLowerCase().includes(q) ||
          opUser.toLowerCase().includes(q);
        const matchRingkasan = (item.ringkasan || '').toLowerCase().includes(q);
        const matchEntitas = (item.entitasNama || '').toLowerCase().includes(q);
        const matchTipe = (item.entitasTipe || '').toLowerCase().includes(q);
        if (!matchOperator && !matchRingkasan && !matchEntitas && !matchTipe) {
          return false;
        }
      }

      // Kategori match
      if (filterKategori.length > 0 && !filterKategori.includes(item.kategori)) {
        return false;
      }

      // Aksi match
      if (filterAksi.length > 0 && !filterAksi.includes(item.aksi)) {
        return false;
      }

      // Operator match
      if (filterOperator.length > 0 && !filterOperator.includes(item.operator?.id)) {
        return false;
      }

      return true;
    });
  }, [auditLogs, cari, filterKategori, filterAksi, filterOperator]);

  // Unique operators for dropdown filter
  const operatorSelectOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [];
    const map = new Map<string, string>();
    auditLogs.forEach((item) => {
      if (item.operator?.id) {
        map.set(item.operator.id, item.operator.nama || 'Operator');
      }
    });
    map.forEach((nama, id) => {
      list.push({ value: id, label: nama });
    });
    return list;
  }, [auditLogs]);

  const selectedLog = useMemo(() => {
    return auditLogs.find((l) => l.id === selectedLogId) || null;
  }, [auditLogs, selectedLogId]);

  const hasFilterActive =
    cari.trim() !== '' ||
    filterKategori.length > 0 ||
    filterAksi.length > 0 ||
    filterOperator.length > 0;

  const resetFilter = () => {
    setCari('');
    setFilterKategori([]);
    setFilterAksi([]);
    setFilterOperator([]);
  };

  // Keyboard shortcut Esc closes detail drawer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedLogId) {
        e.preventDefault();
        setSelectedLogId(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLogId]);

  // 1. Session Loading Guard (prevent false positive Access Denied on refresh)
  if (isSessionLoading) {
    return <AuditLogSkeleton />;
  }

  // 2. Role Guard: Access Denied for Non-Admin
  if (!isAdmin) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 bg-(--color-surface)">
        <div className="flex max-w-md flex-col items-center text-center p-6 rounded-lg border border-(--color-border) bg-(--color-surface) shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-warning-subtle) text-(--color-warning-fg)">
            <Warning16Regular className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-(--color-text-primary)">
            Akses Terbatas Administrator
          </h2>
          <p className="mt-2 text-xs text-(--color-text-secondary) leading-relaxed">
            Menu <strong>Log Audit</strong> hanya dapat diakses oleh Administrator untuk memantau keamanan dan riwayat aktivitas sistem.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/kalender')}
            className="mt-4"
          >
            Kembali ke Kalender
          </Button>
        </div>
      </div>
    );
  }

  // 3. Loading State (enforces 350ms minimum duration to prevent rapid flicker)
  if (isScreenLoading) {
    return <AuditLogSkeleton />;
  }

  return (
    <div className="flex h-full w-full flex-row overflow-hidden bg-(--color-surface)">
      {/* Main Table Column (flex 1) */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col bg-(--color-surface)">
        {/* Top Header Toolbar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-(--color-border) px-3.5 bg-(--color-surface) gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded bg-(--color-brand-subtle) text-(--color-brand)">
              <History20Regular className="w-4 h-4" />
            </div>
            <div className="text-[13.5px] font-semibold text-(--color-text-primary)">
              Log Audit Aktivitas
            </div>
            <span className="text-xs text-(--color-text-muted)">
              · {filteredLogs.length} dari {auditLogs.length} riwayat
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-xs flex-wrap">
          {/* Search Input (Standard Bandrek Toolbar style) */}
          <div className="relative flex-1 min-w-50 max-w-70">
            <input
              type="text"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari aktivitas, entitas, operator..."
              className="h-6.5 w-full rounded border border-(--color-border-strong) bg-(--color-surface) px-2 pr-6 text-xs text-(--color-text-primary) placeholder:text-(--color-text-muted) hover:border-(--color-text-muted) focus:border-(--color-brand) focus:outline-none transition-colors"
            />
            {cari && (
              <button
                type="button"
                onClick={() => setCari('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary) text-xs cursor-pointer border-none bg-transparent p-0"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Kategori */}
          <div className="shrink-0">
            <MultiSelect
              className="w-auto max-w-40 gap-2"
              value={filterKategori}
              onValueChange={setFilterKategori}
              options={KATEGORI_OPTIONS}
              placeholder="Kategori"
              density="compact"
            />
          </div>

          {/* Filter Aksi */}
          <div className="shrink-0">
            <MultiSelect
              className="w-auto max-w-36 gap-2"
              value={filterAksi}
              onValueChange={setFilterAksi}
              options={AKSI_OPTIONS}
              placeholder="Aksi"
              density="compact"
            />
          </div>

          {/* Filter Operator */}
          <div className="shrink-0">
            <MultiSelect
              searchable
              searchPlaceholder="Cari operator..."
              className="w-auto max-w-44 gap-2"
              value={filterOperator}
              onValueChange={setFilterOperator}
              options={operatorSelectOptions}
              placeholder="Operator"
              density="compact"
            />
          </div>

          {/* Reset Filter Button */}
          {hasFilterActive && (
            <Button
              variant="ghost"
              onClick={resetFilter}
              className="text-(--color-brand) hover:bg-(--color-brand-subtle) font-medium"
            >
              Reset filter
            </Button>
          )}
        </div>

        {/* Scrollable Table Area with Sticky Header */}
        <div className="flex-1 min-h-0 overflow-auto">
          {filteredLogs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-xs text-(--color-text-muted)">
              <Search24Regular className="w-8 h-8 opacity-40 mb-2" />
              <div className="text-[13px] font-medium text-(--color-text-secondary)">
                {auditLogs.length === 0
                  ? 'Belum ada riwayat aktivitas tercatat'
                  : 'Tidak ada riwayat aktivitas yang sesuai filter'}
              </div>
              <p className="mt-1 max-w-sm text-(--color-text-muted)">
                {auditLogs.length === 0
                  ? 'Setiap aktivitas perubahan jadwal, realisasi, siswa, dan master data akan tercatat secara otomatis di sini.'
                  : 'Coba ubah kata kunci pencarian atau bersihkan filter untuk menampilkan data audit log.'}
              </p>
              {hasFilterActive && (
                <Button
                  variant="secondary"
                  onClick={resetFilter}
                  className="mt-3"
                >
                  Reset filter
                </Button>
              )}
            </div>
          ) : (
            <div className="min-w-225">
              {/* Sticky Table Header */}
              <div className="sticky top-0 z-10 flex h-7.5 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[11px] font-semibold tracking-wider text-(--color-text-secondary) uppercase select-none">
                <div className="w-44 shrink-0">WAKTU</div>
                <div className="w-48 shrink-0">OPERATOR</div>
                <div className="w-24 shrink-0">AKSI</div>
                <div className="w-48 shrink-0">ENTITAS</div>
                <div className="flex-1 min-w-50">RINGKASAN AKTIVITAS</div>
              </div>

              {/* Table Body Rows */}
              {filteredLogs.map((item) => {
                const isSelected = selectedLogId === item.id;
                const badge = getAksiBadge(item.aksi);
                const waktuStr = formatWaktuIndo(item.waktu);
                const operatorNama = item.operator?.nama || 'Operator';
                const initials = operatorNama.slice(0, 2).toUpperCase();

                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      setSelectedLogId((prev) => (prev === item.id ? null : item.id))
                    }
                    className={`flex h-9 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 text-[12.5px] cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]'
                        : 'bg-(--color-surface) hover:bg-(--color-surface-alt)'
                    }`}
                  >
                    {/* Waktu */}
                    <div className="w-44 shrink-0 font-mono text-[11.5px] text-(--color-text-secondary) truncate pr-2">
                      {waktuStr}
                    </div>

                    {/* Operator */}
                    <div className="w-48 shrink-0 flex items-center gap-2 truncate pr-2">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--color-surface-alt) text-(--color-text-secondary) text-[9.5px] font-semibold border border-(--color-border)">
                        {initials}
                      </div>
                      <span className="truncate font-medium text-(--color-text-primary)">
                        {operatorNama}
                      </span>
                    </div>

                    {/* Aksi Badge */}
                    <div className="w-24 shrink-0 pr-2">
                      <span
                        className={`inline-flex items-center h-4.5 px-2 rounded-full text-[10.5px] font-semibold border whitespace-nowrap ${badge.border} ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Entitas */}
                    <div className="w-48 shrink-0 truncate pr-2 text-xs">
                      <span className="font-semibold text-(--color-text-secondary) mr-1">
                        [{item.entitasTipe}]
                      </span>
                      <span className="text-(--color-text-primary)">{item.entitasNama}</span>
                    </div>

                    {/* Ringkasan */}
                    <div className="flex-1 min-w-50 truncate pr-2 text-xs text-(--color-text-secondary)">
                      {item.ringkasan}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Slide-out Side Panel (380px) */}
      {selectedLog && (
        <div className="w-95 shrink-0 border-l border-(--color-border) bg-(--color-surface) flex flex-col min-h-0 shadow-lg animate-in slide-in-from-right duration-150">
          {/* Detail Header */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-(--color-border) px-3.5 bg-(--color-surface)">
            <div className="text-[13px] font-semibold text-(--color-text-primary)">
              Detail Riwayat Aktivitas
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setSelectedLogId(null)}
              title="Tutup (Esc)"
            >
              <Dismiss16Regular className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Detail Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
            {/* Meta Card */}
            <div className="rounded border border-(--color-border) bg-(--color-surface-alt) p-2.5 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-(--color-text-muted)">Waktu Kejadian</span>
                <span className="font-mono text-(--color-text-primary) font-medium">
                  {formatWaktuIndo(selectedLog.waktu)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-(--color-text-muted)">Alamat IP</span>
                <span className="font-mono text-(--color-text-secondary)">
                  {selectedLog.ipAddress || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-(--color-text-muted)">Kategori</span>
                <span className="capitalize font-medium text-(--color-text-primary)">
                  {selectedLog.kategori}
                </span>
              </div>
            </div>

            {/* Operator Card */}
            <div className="rounded border border-(--color-border) bg-(--color-surface) p-2.5 flex flex-col gap-1 text-xs">
              <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                OPERATOR PELAKSANA
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-brand-subtle) text-(--color-brand) text-xs font-semibold">
                  <Person24Regular className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-(--color-text-primary) truncate">
                    {selectedLog.operator?.nama || 'Operator'}
                  </div>
                  <div className="text-[11px] text-(--color-text-muted) font-mono">
                    @{selectedLog.operator?.username || '—'} · {selectedLog.operator?.peran || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Aktivitas & Ringkasan */}
            {(() => {
              const detailBadge = getAksiBadge(selectedLog.aksi);
              return (
                <div className="rounded border border-(--color-border) bg-(--color-surface) p-2.5 flex flex-col gap-1.5 text-xs">
                  <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                    RINGKASAN AKTIVITAS
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-flex items-center h-4.5 px-2 rounded-full text-[10.5px] font-semibold border ${detailBadge.border} ${detailBadge.bg} ${detailBadge.text}`}
                    >
                      {detailBadge.label}
                    </span>
                    <span className="font-semibold text-(--color-text-primary)">
                      [{selectedLog.entitasTipe}] {selectedLog.entitasNama}
                    </span>
                  </div>
                  <p className="text-(--color-text-secondary) leading-relaxed mt-1">
                    {selectedLog.ringkasan}
                  </p>
                </div>
              );
            })()}

            {/* Field Diff Section */}
            {selectedLog.diff && selectedLog.diff.length > 0 && (
              <div className="rounded border border-(--color-border) bg-(--color-surface) p-2.5 flex flex-col gap-2 text-xs">
                <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                  PERUBAHAN BIDANG DATA ({selectedLog.diff.length})
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {selectedLog.diff.map((df: AuditFieldDiff, i: number) => (
                    <div
                      key={i}
                      className="rounded border border-(--color-border-subtle) bg-(--color-surface-alt) p-2 flex flex-col gap-1"
                    >
                      <div className="font-semibold text-[11.5px] text-(--color-text-primary)">
                        {df.label}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11.5px] mt-0.5">
                        {df.sebelum !== undefined && (
                          <div className="flex flex-col p-1 rounded bg-(--color-danger-subtle) border border-(--color-danger)">
                            <span className="text-[10px] text-(--color-danger-fg) font-semibold uppercase">
                              Sebelum
                            </span>
                            <span className="text-(--color-text-primary) line-through truncate">
                              {df.sebelum}
                            </span>
                          </div>
                        )}
                        {df.sesudah !== undefined && (
                          <div className="flex flex-col p-1 rounded bg-[#E8F5E9] border border-[#4CAF50]">
                            <span className="text-[10px] text-[#2E7D32] font-semibold uppercase">
                              Sesudah
                            </span>
                            <span className="text-(--color-text-primary) font-medium truncate">
                              {df.sesudah}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
