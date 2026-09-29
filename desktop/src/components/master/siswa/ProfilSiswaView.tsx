import { useState, useRef, useEffect } from 'react';
import type { SiswaProfil } from '@/data/types/master';

interface ProfilSiswaViewProps {
  profil: SiswaProfil;
  onBack: () => void;
  onEdit: (id: string) => void;
  onCetak: () => void;
  onJadwalkanSusulan: () => void;
}

export function ProfilSiswaView({
  profil,
  onBack,
  onEdit,
  onCetak,
  onJadwalkanSusulan,
}: ProfilSiswaViewProps) {
  const { siswa, inisial, kelasTeks, kpi, riwayat, opsiMapel, cakupan, terlewat } = profil;

  const [filterMode, setFilterMode] = useState<'semua' | 'tidakHadir'>('semua');
  const [mapelFilter, setMapelFilter] = useState<string>('');
  const [mapelOpen, setMapelOpen] = useState(false);

  const mapelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mapelRef.current && !mapelRef.current.contains(e.target as Node)) {
        setMapelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered riwayat
  const filteredRiwayat = riwayat.filter((r) => {
    if (filterMode === 'tidakHadir') {
      const isTidakHadir =
        r.kehadiran.status === 'izin' ||
        r.kehadiran.status === 'sakit' ||
        r.kehadiran.status === 'alpa' ||
        r.kehadiran.status === 'batal';
      if (!isTidakHadir) return false;
    }
    if (mapelFilter) {
      const matchMapel = r.materi.toLowerCase().startsWith(mapelFilter.toLowerCase());
      if (!matchMapel) return false;
    }
    return true;
  });

  const mapelObj = opsiMapel.find((m) => m.id === mapelFilter || m.nama === mapelFilter);
  const mapelLabel = mapelObj ? mapelObj.nama : 'Semua mapel';

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-y-auto bg-(--color-surface) p-4 px-5.5 pb-8 gap-4">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          title="Kembali ke daftar siswa"
          className="flex h-6 w-6 items-center justify-center rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary) cursor-pointer transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.35 3.65c.2.2.2.5 0 .7L6.21 8.5l4.14 4.15c.2.2.2.5 0 .7-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7l4.5-4.5c.2-.2.5-.2.7 0Z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="border-none bg-transparent p-0 text-[13px] text-(--color-brand) hover:underline cursor-pointer"
        >
          Siswa
        </button>

        <span className="text-[13px] text-(--color-text-disabled)">›</span>

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-(--color-brand-subtle) text-[11.5px] font-semibold text-(--color-brand-ink)">
          {inisial}
        </div>

        <div className="text-[16.5px] font-semibold text-(--color-text-primary)">
          {siswa.nama}
        </div>

        <span
          className={`inline-flex h-4.75 items-center px-2.25 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
            siswa.aktif
              ? 'border-(--color-success) bg-(--color-success-bg) text-(--color-success-ink)'
              : 'border-(--color-border-strong) bg-(--color-surface-sunken) text-(--color-text-muted)'
          }`}
        >
          {siswa.aktif ? 'Aktif' : 'Nonaktif'}
        </span>

        <div className="text-[12.5px] text-(--color-text-muted)">
          {siswa.jenjang} · {kelasTeks}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onCetak}
          title="Cetak rapor kegiatan"
          className="flex h-7 items-center px-3 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-[12.5px] text-(--color-text-primary) cursor-pointer whitespace-nowrap transition-colors"
        >
          Cetak rapor kegiatan
        </button>

        <button
          type="button"
          onClick={() => onEdit(siswa.id)}
          title="Ubah data siswa ini"
          className="flex h-7 items-center px-3.5 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-[12.5px] font-semibold text-white cursor-pointer whitespace-nowrap transition-colors"
        >
          Ubah data
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="flex flex-wrap gap-2.5">
        {kpi.map((k, i) => (
          <div
            key={i}
            className="flex-1 min-w-42.5 rounded-lg border p-2.75 px-3.25"
            style={{
              borderColor: k.brd,
              backgroundColor: k.bg,
            }}
          >
            <div
              className="text-[10.5px] font-semibold tracking-wider"
              style={{ color: k.lblFg }}
            >
              {k.label}
            </div>
            <div
              className="mt-0.5 text-[23px] font-bold leading-tight"
              style={{ color: k.valFg }}
            >
              {k.val}
            </div>
            <div
              className="mt-0.75 text-[11px] leading-snug"
              style={{ color: k.subFg }}
            >
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Left Column: Riwayat Kegiatan */}
        <div className="flex-1 min-w-95 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-0 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
              RIWAYAT KEGIATAN
            </div>

            <button
              type="button"
              onClick={() => setFilterMode('semua')}
              className={`h-6 rounded-full px-2.5 text-[11.5px] cursor-pointer whitespace-nowrap border transition-colors ${
                filterMode === 'semua'
                  ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                  : 'border-(--color-border-strong) bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-alt)'
              }`}
            >
              Semua
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('tidakHadir')}
              className={`h-6 rounded-full px-2.5 text-[11.5px] cursor-pointer whitespace-nowrap border transition-colors ${
                filterMode === 'tidakHadir'
                  ? 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                  : 'border-(--color-border-strong) bg-(--color-surface) text-(--color-text-secondary) hover:bg-(--color-surface-alt)'
              }`}
            >
              Tidak hadir
            </button>

            {/* Mapel Filter Dropdown */}
            <div className="relative shrink-0" ref={mapelRef}>
              <button
                type="button"
                onClick={() => setMapelOpen((prev) => !prev)}
                className="flex h-6 items-center justify-between gap-2 rounded-full border border-(--color-border-strong) bg-(--color-surface) px-2.5 text-[11.5px] text-(--color-text-secondary) hover:border-(--color-text-muted) cursor-pointer whitespace-nowrap"
              >
                <span>{mapelLabel}</span>
                <svg width="11" height="11" viewBox="0 0 16 16" className="text-(--color-text-muted)">
                  <path
                    fill="currentColor"
                    d="M3.15 5.65c.2-.2.5-.2.7 0L8 9.79l4.15-4.14c.2-.2.5-.2.7 0 .2.2.2.5 0 .7l-4.5 4.5c-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7Z"
                  />
                </svg>
              </button>

              {mapelOpen && (
                <div className="absolute left-0 top-6.75 z-12 min-w-full w-max max-h-65 overflow-y-auto rounded-md border border-(--color-border-strong) bg-(--color-surface) p-1 shadow-lg flex flex-col gap-0.25">
                  <button
                    type="button"
                    onClick={() => {
                      setMapelFilter('');
                      setMapelOpen(false);
                    }}
                    className={`w-full rounded px-2.25 py-1.5 text-left text-[12.5px] whitespace-nowrap cursor-pointer ${
                      !mapelFilter
                        ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                        : 'hover:bg-(--color-brand-subtle) text-(--color-text-primary)'
                    }`}
                  >
                    Semua mapel
                  </button>
                  {opsiMapel.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMapelFilter(m.nama);
                        setMapelOpen(false);
                      }}
                      className={`w-full rounded px-2.25 py-1.5 text-left text-[12.5px] whitespace-nowrap cursor-pointer ${
                        mapelFilter === m.nama
                          ? 'bg-(--color-brand-subtle) text-(--color-brand-ink) font-semibold'
                          : 'hover:bg-(--color-brand-subtle) text-(--color-text-primary)'
                      }`}
                    >
                      {m.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Riwayat */}
          <div className="rounded-lg border border-(--color-border) overflow-hidden bg-(--color-surface)">
            <div className="flex h-6.5 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-2.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
              <div className="w-16 shrink-0">TANGGAL</div>
              <div className="flex-1 min-w-30">KEGIATAN</div>
              <div className="w-27.5 shrink-0">MATERI</div>
              <div className="w-24 shrink-0">KEHADIRAN</div>
              <div className="w-32.5 shrink-0">CATATAN</div>
            </div>

            {filteredRiwayat.length > 0 ? (
              filteredRiwayat.map((r, i) => (
                <div
                  key={r.id}
                  className={`flex min-h-8 items-center px-2.5 py-1.5 text-xs hover:bg-(--color-surface-alt) transition-colors ${
                    i > 0 ? 'border-t border-(--color-border-subtle)' : ''
                  }`}
                >
                  <div className="w-16 shrink-0 font-mono text-[11px] text-(--color-text-muted)">
                    {r.tanggalFormatted}
                  </div>
                  <div
                    className={`flex-1 min-w-30 truncate pr-2 text-[12.5px] ${
                      r.kehadiran.status === 'batal'
                        ? 'text-(--color-text-muted) line-through'
                        : 'text-(--color-text-primary)'
                    }`}
                  >
                    {r.nama}
                  </div>
                  <div className="w-27.5 shrink-0 truncate pr-1.5 text-xs text-(--color-text-secondary)">
                    {r.materi}
                  </div>
                  <div className="w-24 shrink-0">
                    <span
                      className="inline-flex h-4.5 items-center px-1.75 rounded-full text-[10.5px] font-semibold border whitespace-nowrap"
                      style={{
                        borderColor: r.kehadiran.brd,
                        backgroundColor: r.kehadiran.bg,
                        color: r.kehadiran.ink,
                      }}
                    >
                      {r.kehadiran.glyph} {r.kehadiran.label}
                    </span>
                  </div>
                  <div className="w-32.5 shrink-0 truncate text-[11.5px] text-(--color-text-muted)">
                    {r.catatan}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[12.5px] text-(--color-text-muted)">
                Tidak ada kegiatan yang cocok dengan filter ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cakupan & Materi Terlewat */}
        <div className="w-70 shrink-0 flex flex-col gap-3">
          {/* Cakupan Materi Per Mapel */}
          <div>
            <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) mb-2">
              CAKUPAN MATERI PER MATA PELAJARAN
            </div>
            <div className="flex flex-col gap-2.5">
              {cakupan.length > 0 ? (
                cakupan.map((c) => (
                  <div key={c.mapelId}>
                    <div className="flex justify-between text-[12.5px] mb-0.75 text-(--color-text-primary)">
                      <span>{c.nama}</span>
                      <span className="font-mono" style={{ color: c.fracFg }}>
                        {c.frac}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-(--color-surface-sunken) overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: c.barW, backgroundColor: c.barBg }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-(--color-text-muted)">
                  Belum ada mata pelajaran dengan materi untuk jenjang ini.
                </div>
              )}
            </div>
          </div>

          {/* Materi Terlewat */}
          <div>
            <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) mb-2">
              MATERI TERLEWAT
            </div>
            <div className="flex flex-col gap-1.75">
              {terlewat.length > 0 ? (
                terlewat.map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-(--color-border) bg-(--color-surface) p-2"
                  >
                    <div className="text-[12.5px] font-semibold text-(--color-text-primary)">
                      {t.judul}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-(--color-text-muted)">
                      {t.alasan} ·{' '}
                      <button
                        type="button"
                        onClick={onJadwalkanSusulan}
                        className="border-none bg-transparent p-0 text-[11.5px] text-(--color-brand) hover:underline cursor-pointer"
                      >
                        jadwalkan susulan
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-(--color-text-muted)">
                  Tidak ada materi yang terlewat.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
