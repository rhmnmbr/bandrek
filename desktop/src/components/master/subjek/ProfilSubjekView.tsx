import type { SubjekProfil, KetersediaanRutinItem } from '@/data/types/master';

interface ProfilSubjekViewProps {
  profil: SubjekProfil;
  onBack: () => void;
  onUbahData: () => void;
  onLihatKalender: () => void;
  onBukaKegiatan: (kegiatanId: string) => void;
  onBukaRealisasi: (kegiatanId: string) => void;
  onTambahKetersediaan: (item: KetersediaanRutinItem) => void;
  onUbahKetersediaan: (index: number, patch: Partial<KetersediaanRutinItem>) => void;
  onHapusKetersediaan: (index: number) => void;
  onToggleAktif: () => void;
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export function ProfilSubjekView({
  profil,
  onBack,
  onUbahData,
  onLihatKalender,
  onBukaKegiatan,
  onBukaRealisasi,
  onTambahKetersediaan,
  onUbahKetersediaan,
  onHapusKetersediaan,
  onToggleAktif,
}: ProfilSubjekViewProps) {
  const { subjek, inisial, mapelTeks, kpi, bebanJudul, batasNyaman, beban, terdekat } = profil;

  const kelaminText =
    subjek.kelamin === 'L' ? 'Laki-laki' : subjek.kelamin === 'P' ? 'Perempuan' : '—';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-(--color-surface) p-4 md:px-5.5 md:py-7.5 flex flex-col gap-4">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <button
          type="button"
          onClick={onBack}
          title="Kembali ke daftar subjek"
          className="flex h-6 w-6 items-center justify-center rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-xs cursor-pointer transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.35 3.65c.2.2.2.5 0 .7L6.21 8.5l4.14 4.15c.2.2.2.5 0 .7-.2.2-.5.2-.7 0l-4.5-4.5c-.2-.2-.2-.5 0-.7l4.5-4.5c.2-.2.5-.2.7 0Z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="border-none bg-transparent p-0 text-[13px] text-(--color-brand) hover:underline cursor-pointer font-medium"
        >
          Subjek
        </button>
        <span className="text-[13px] text-(--color-text-muted)">›</span>

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBF3FC] text-[#0C548F] text-[11.5px] font-semibold">
          {inisial}
        </div>

        <div className="text-[16.5px] font-semibold text-(--color-text-primary)">{subjek.nama}</div>

        <span
          className={`inline-flex items-center h-4.75 px-2.25 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
            subjek.aktif
              ? 'border-(--color-success) bg-(--color-success-subtle) text-(--color-success-fg)'
              : 'border-(--color-border-strong) bg-(--color-surface-sunken) text-(--color-text-muted)'
          }`}
        >
          {subjek.aktif ? 'Aktif' : 'Nonaktif'}
        </span>

        <div className="text-[12.5px] text-(--color-text-muted)">
          {subjek.peran} · {mapelTeks}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onLihatKalender}
          title="Lihat kegiatan subjek ini di kalender"
          className="h-7 px-3 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-[12.5px] text-(--color-text-primary) cursor-pointer whitespace-nowrap transition-colors"
        >
          Lihat di kalender
        </button>
        <button
          type="button"
          onClick={onUbahData}
          title="Ubah data subjek ini"
          className="h-7 px-3.5 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
        >
          Ubah data
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="flex gap-2.5 flex-wrap shrink-0">
        {kpi.map((k, i) => (
          <div
            key={i}
            className="flex-1 min-w-[170px] rounded-lg border p-2.75 flex flex-col justify-between"
            style={{
              borderColor: k.brd,
              backgroundColor: k.bg,
            }}
          >
            <div
              className="text-[10.5px] tracking-wider uppercase font-medium"
              style={{ color: k.lblFg }}
            >
              {k.label}
            </div>
            <div
              className="text-[23px] font-bold leading-tight mt-0.5"
              style={{ color: k.valFg }}
            >
              {k.val}
            </div>
            {k.subLink && k.subKlikParam ? (
              <button
                type="button"
                onClick={() => onBukaRealisasi(k.subKlikParam!)}
                title={k.subKlikTitle}
                className="border-none bg-transparent p-0 text-[11px] text-[#0C548F] hover:text-(--color-brand) underline cursor-pointer text-left mt-0.75 block"
              >
                {k.sub}
              </button>
            ) : (
              <div
                className="text-[11px] leading-snug mt-0.75"
                style={{ color: k.subFg }}
              >
                {k.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-4 flex-wrap items-start">
        {/* Left Column (Workload & Nearby Events) */}
        <div className="flex-[1.7] min-w-[380px] flex flex-col gap-3.5">
          {/* Workload Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) flex-1">
                {bebanJudul}
              </div>
              <div className="text-[11px] text-(--color-text-muted)">
                batas nyaman {batasNyaman} jam/minggu
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {beban.map((b, i) => (
                <div key={i}>
                  <div className="flex items-center gap-1.5 text-[12.5px] mb-0.75">
                    {b.warn && <span className="text-(--color-warning-fg)">⚠</span>}
                    <span className="flex-1 text-(--color-text-primary)">{b.label}</span>
                    <span className="font-mono text-(--color-text-secondary)">
                      {b.jam} jam · {b.n} kegiatan
                    </span>
                  </div>
                  <div className="h-1.75 rounded-full bg-(--color-surface-alt) overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: b.barW,
                        backgroundColor: b.barBg,
                      }}
                    />
                  </div>
                  {b.warn && b.warnTeks && (
                    <div className="text-[11px] text-(--color-warning-fg) mt-0.75">
                      {b.warnTeks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Activities Table */}
          <div>
            <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) mb-2">
              KEGIATAN TERDEKAT
            </div>
            <div className="border border-(--color-border) rounded-lg overflow-hidden bg-(--color-surface)">
              {/* Header */}
              <div className="flex items-center h-6.5 bg-(--color-surface-alt) border-b border-(--color-border) px-2.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div className="w-[120px] shrink-0">WAKTU</div>
                <div className="flex-1 min-w-[120px]">KEGIATAN</div>
                <div className="w-[86px] shrink-0">PERAN</div>
                <div className="w-[130px] shrink-0">STATUS</div>
              </div>

              {/* Rows */}
              {terdekat.length > 0 ? (
                terdekat.map((d, i) => (
                  <div
                    key={d.id}
                    onClick={() => onBukaKegiatan(d.id)}
                    title="Buka kegiatan ini"
                    className={`flex items-center h-8 px-2.5 cursor-pointer bg-(--color-surface) hover:bg-(--color-surface-alt) transition-colors ${
                      i > 0 ? 'border-t border-(--color-border-subtle)' : ''
                    }`}
                  >
                    <div className="w-[120px] shrink-0 font-mono text-[11px] text-(--color-text-muted)">
                      {d.waktu}
                    </div>
                    <div className="flex-1 min-w-[120px] text-[12.5px] text-(--color-text-primary) truncate pr-2">
                      {d.nama}
                    </div>
                    <div className="w-[86px] shrink-0 text-xs text-(--color-text-secondary)">
                      {d.peran}
                    </div>
                    <div className="w-[130px] shrink-0">
                      <span
                        className="inline-flex items-center h-4.5 px-1.75 rounded-full text-[10.5px] font-semibold border whitespace-nowrap"
                        style={{
                          borderColor: d.stBrd,
                          backgroundColor: d.stBg,
                          color: d.stInk,
                        }}
                      >
                        {d.stLabel}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-[12.5px] text-(--color-text-muted) text-center">
                  Tidak ada kegiatan terjadwal untuk subjek ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Data Subjek & Availability) */}
        <div className="flex-1 min-w-[280px] flex flex-col gap-3">
          {/* Data Subjek Card */}
          <div className="rounded-lg border border-(--color-border) bg-(--color-surface-alt) p-3 md:p-3.5 flex flex-col gap-2.5">
            <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
              DATA SUBJEK
            </div>
            <div className="flex flex-col gap-1.5 text-[12.5px]">
              <div className="flex justify-between gap-2">
                <span className="text-(--color-text-muted)">Peran bawaan</span>
                <span className="text-(--color-text-primary) font-medium">{subjek.peran}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-(--color-text-muted)">Jenis kelamin</span>
                <span className="text-(--color-text-primary)">{kelaminText}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-(--color-text-muted)">Kontak</span>
                <span className="font-mono text-[11.5px] text-(--color-text-primary)">
                  {subjek.kontak || '—'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-(--color-text-muted)">Mata pelajaran</span>
                <span className="text-right max-w-[170px] text-(--color-text-primary)">
                  {mapelTeks}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-(--color-text-muted) pt-1 border-t border-(--color-border-subtle)">
              Untuk mengubah, pakai "Ubah data" di atas.
            </div>
          </div>

          {/* Ketersediaan Rutin Card */}
          <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3 md:p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) flex-1">
                KETERSEDIAAN RUTIN
              </div>
              <button
                type="button"
                onClick={() =>
                  onTambahKetersediaan({
                    hari: 'Senin',
                    dari: '07:00',
                    sampai: '12:00',
                  })
                }
                className="h-5.5 px-2 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-brand-subtle) text-(--color-brand) text-[11.5px] cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="shrink-0 relative top-[0.5px]"
                >
                  <line x1="8" y1="3" x2="8" y2="13" />
                  <line x1="3" y1="8" x2="13" y2="8" />
                </svg>
                Tambah jadwal
              </button>
            </div>

            {subjek.ketersediaan && subjek.ketersediaan.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {subjek.ketersediaan.map((k, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <select
                      value={k.hari}
                      onChange={(e) => onUbahKetersediaan(idx, { hari: e.target.value })}
                      className="w-[92px] shrink-0 h-6.5 rounded border border-(--color-border-strong) bg-(--color-surface) px-1 text-xs text-(--color-text-primary) focus:outline-none focus:border-(--color-brand)"
                    >
                      {HARI_LIST.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={k.dari}
                      onChange={(e) => onUbahKetersediaan(idx, { dari: e.target.value })}
                      placeholder="07:00"
                      className="w-14 h-6.5 rounded border border-(--color-border-strong) px-1.25 font-mono text-[11.5px] text-(--color-text-primary) focus:outline-none focus:border-(--color-brand)"
                    />
                    <span className="text-(--color-text-muted)">–</span>
                    <input
                      type="text"
                      value={k.sampai}
                      onChange={(e) => onUbahKetersediaan(idx, { sampai: e.target.value })}
                      placeholder="12:00"
                      className="w-14 h-6.5 rounded border border-(--color-border-strong) px-1.25 font-mono text-[11.5px] text-(--color-text-primary) focus:outline-none focus:border-(--color-brand)"
                    />

                    <button
                      type="button"
                      onClick={() => onHapusKetersediaan(idx)}
                      title="Hapus jadwal ini"
                      className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded border-none bg-transparent text-(--color-text-muted) hover:bg-(--color-danger-subtle) hover:text-(--color-danger) cursor-pointer transition-colors"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                      >
                        <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
                        <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-(--color-text-muted) leading-relaxed">
                Belum diatur. Di luar jam yang diisi, form kegiatan hanya memberi peringatan lunak,
                bukan penolakan.
              </div>
            )}
          </div>

          {/* Overdue Warning Box */}
          {profil.tertundaCount > 0 && (
            <div className="rounded-lg border border-(--color-warning) bg-(--color-warning-subtle) p-3 flex flex-col gap-1.5">
              <div className="text-[12.5px] font-semibold text-(--color-warning-fg) flex items-center gap-1.5">
                <span>⚠</span>
                <span>{profil.tertundaJudul}</span>
              </div>
              <div className="text-xs text-(--color-warning-fg) leading-relaxed">
                {profil.tertundaTeks}
              </div>
              {profil.tertundaId && (
                <button
                  type="button"
                  onClick={() => onBukaRealisasi(profil.tertundaId!)}
                  className="self-start h-7 px-3 rounded border border-(--color-warning-fg) bg-(--color-surface) hover:bg-[#FFF9F0] text-(--color-warning-fg) text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors mt-0.5"
                >
                  Isi realisasi sekarang
                </button>
              )}
            </div>
          )}

          {/* Toggle Active Button */}
          <button
            type="button"
            onClick={onToggleAktif}
            className={`self-start border-none bg-transparent p-0 text-[12.5px] hover:underline cursor-pointer font-medium ${
              subjek.aktif ? 'text-(--color-warning-fg)' : 'text-(--color-success-fg)'
            }`}
          >
            {subjek.aktif ? 'Nonaktifkan subjek' : 'Aktifkan kembali subjek'}
          </button>
        </div>
      </div>
    </div>
  );
}
