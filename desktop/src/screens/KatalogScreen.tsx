import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input, SearchInput, Textarea, FormLabel, InlineError } from "@/components/ui/input";
import { Select, GroupedRuanganSelect } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker, TimeRangePicker } from "@/components/ui/time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  KegiatanBadge,
  KehadiranBadge,
  MasterStatusBadge,
  FilterChip,
} from "@/components/ui/badge";
import {
  KehadiranSegmentedControl,
  KetuntasanSegmentedControl,
  type KehadiranValue,
  type KetuntasanValue,
} from "@/components/ui/segmented-control";
import {
  CalendarEvent,
  MoreEventsGroup,
  type JenisKegiatanKey,
} from "@/components/ui/calendar-event";
import { MatrixCell, type MatrixCellState } from "@/components/ui/matrix-cell";
import { SubjekChip, AddSubjekButton, type SubjekPeran } from "@/components/ui/subjek-chip";
import { StudentChecklist, type StudentGroup } from "@/components/ui/student-checklist";
import { ConflictWarning } from "@/components/ui/conflict-warning";
import { ErrorSummary } from "@/components/ui/error-summary";
import { ConfirmDialog } from "@/components/ui/dialog";
import { SaveConflictModal } from "@/components/kegiatan/SaveConflictModal";
import { SidePanel } from "@/components/ui/side-panel";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { OfflineBanner } from "@/components/ui/offline-banner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowLeft16Regular,
  CalendarLtr24Regular,
  Checkmark16Regular,
  LineHorizontal316Regular,
  Search24Regular,
  Warning16Regular,
  Warning24Regular,
} from "@fluentui/react-icons";

export function KatalogScreen() {
  const { showToast } = useToast();

  // Screen interactive state
  const [offlineBannerActive, setOfflineBannerActive] = React.useState(true);
  const [offlineVariant, setOfflineVariant] = React.useState<
    "dark-charcoal" | "danger-subtle" | "surface-sunken" | "warning"
  >("surface-sunken");

  // Segmented control interactive state
  const [kehadiranVal, setKehadiranVal] = React.useState<KehadiranValue>("hadir");
  const [ketuntasanVal, setKetuntasanVal] = React.useState<KetuntasanValue>("tuntas");

  // Subjek chip interactive state
  const [subjekList, setSubjekList] = React.useState<{ id: string; nama: string; peran: SubjekPeran }[]>([
    { id: "1", nama: "Bu Sari", peran: "Pengisi" },
    { id: "2", nama: "Pak Dedi", peran: "Support" },
    { id: "3", nama: "Kak Rian", peran: "Pendamping" },
  ]);

  // Student checklist interactive state
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([
    "s1",
    "s2",
    "s3",
    "s4",
  ]);

  // Dialogs interactive state
  const [dialogNonaktifOpen, setDialogNonaktifOpen] = React.useState(false);
  const [dialogBatalOpen, setDialogBatalOpen] = React.useState(false);
  const [conflictModalOpen, setConflictModalOpen] = React.useState(false);

  // Side panel interactive state
  const [panelOpen, setPanelOpen] = React.useState(false);

  // Sample student groups for checklist
  const studentGroups: StudentGroup[] = [
    {
      id: "g1",
      nama: "Kelas SD Sore",
      students: [
        { id: "s1", nama: "Aisyah Nur", jenjang: "SD" },
        { id: "s2", nama: "Bagas Pratama", jenjang: "SD" },
        { id: "s3", nama: "Citra Dewi", jenjang: "SD" },
        { id: "s4", nama: "Dimas Saputra", jenjang: "SD" },
        { id: "s5", nama: "Eka Wulandari", jenjang: "SD" },
      ],
    },
    {
      id: "g2",
      nama: "Kelas SMP Pagi",
      students: [
        { id: "s6", nama: "Fajar Ramadhan", jenjang: "SMP" },
        { id: "s7", nama: "Gilang Permana", jenjang: "SMP" },
        { id: "s8", nama: "Hana Salsabila", jenjang: "SMP" },
      ],
    },
  ];

  // Sample grouped ruangan (matches prototype exact data)
  const sampleRuanganGroups = [
    {
      id: "t1",
      nama: "Bandrek Pusat",
      ruangan: [
        { id: "r1", nama: "R. Melati", kapasitas: 12 },
        { id: "r2", nama: "R. Anggrek", kapasitas: 14 },
        { id: "r3", nama: "R. Rapat", kapasitas: 8 },
        { id: "r4", nama: "R. Kenanga", kapasitas: 20 },
      ],
    },
    {
      id: "t2",
      nama: "Cabang Utara",
      ruangan: [
        { id: "r5", nama: "Lap. Utama", kapasitas: 30 },
        { id: "r6", nama: "R. Cempaka", kapasitas: 16 },
        { id: "r7", nama: "R. Dahlia", kapasitas: 10 },
      ],
    },
    {
      id: "t3",
      nama: "Cabang Timur",
      ruangan: [
        { id: "r8", nama: "R. Bougenville", kapasitas: 12 },
      ],
    },
  ];

  return (
    <div
      className="min-h-screen bg-(--color-canvas) text-(--color-text) transition-colors duration-(--dur-normal)"
    >
      {/* Pinned Top Container: Offline Banner + Header stay fixed at top and never scroll */}
      <div className="sticky top-0 z-40 w-full flex flex-col">
        {offlineBannerActive && (
          <OfflineBanner
            variant={offlineVariant}
            cachedAt="16 Sep 2026, 11:45"
            onRetry={() => {
              showToast({
                type: "info",
                message: "Mencoba menyambung kembali ke server...",
              });
              setTimeout(() => {
                setOfflineBannerActive(false);
                showToast({
                  type: "success",
                  message: "Tersambung ke server",
                });
              }, 1200);
            }}
          />
        )}

        {/* Header bar */}
        <header className="bg-white border-b border-(--color-border) px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-(--color-brand) text-white font-bold flex items-center justify-center text-[15px]">
            B
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-(--color-text) leading-tight">
              Katalog Komponen Bandrek
            </h1>
            <p className="text-[11.5px] text-(--color-text-muted)">
              Acuan Implementasi Design System · Sesuai DESIGN.md &amp; Bandrek DS Spesifikasi (Selalu Compact)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Offline Treatment Proposal Switcher */}
          <div className="flex items-center gap-1 bg-(--color-surface-alt) p-0.5 border border-(--color-border) rounded-md text-[11px]">
            <span className="px-1.5 text-(--color-text-muted) font-medium">Banner Offline:</span>
            <button
              type="button"
              onClick={() => {
                setOfflineBannerActive(true);
                setOfflineVariant("dark-charcoal");
              }}
              title="Proposal 1: Dark Charcoal OS/System Banner"
              className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                offlineBannerActive && offlineVariant === "dark-charcoal"
                  ? "bg-[#242424] text-white font-semibold"
                  : "text-(--color-text-muted) hover:text-(--color-text)"
              }`}
            >
              Dark Slate
            </button>
            <button
              type="button"
              onClick={() => {
                setOfflineBannerActive(true);
                setOfflineVariant("danger-subtle");
              }}
              title="Proposal 2: Danger-Subtle (Error blocks)"
              className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                offlineBannerActive && offlineVariant === "danger-subtle"
                  ? "bg-(--color-danger-bg) text-(--color-danger-ink) border border-(--color-danger) font-semibold"
                  : "text-(--color-text-muted) hover:text-(--color-text)"
              }`}
            >
              Merah
            </button>
            <button
              type="button"
              onClick={() => {
                setOfflineBannerActive(true);
                setOfflineVariant("surface-sunken");
              }}
              title="Proposal 3: Muted Surface Sunken with locked icon"
              className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                offlineBannerActive && offlineVariant === "surface-sunken"
                  ? "bg-(--color-surface-sunken) text-(--color-text) border border-(--color-border-strong) font-semibold"
                  : "text-(--color-text-muted) hover:text-(--color-text)"
              }`}
            >
              Abu Muted
            </button>
            <button
              type="button"
              onClick={() => {
                setOfflineBannerActive(true);
                setOfflineVariant("warning");
              }}
              title="Perbandingan: Warning Kuning (Lunak)"
              className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                offlineBannerActive && offlineVariant === "warning"
                  ? "bg-(--color-warning-bg) text-(--color-warning-ink) border border-(--color-warning) font-semibold"
                  : "text-(--color-text-muted) hover:text-(--color-text)"
              }`}
            >
              Kuning
            </button>
          </div>

          {/* Toggle Banner on/off */}
          <Button
            variant="ghost"
            size="compact"
            onClick={() => setOfflineBannerActive(!offlineBannerActive)}
          >
            {offlineBannerActive ? "Tutup Banner" : "Tampilkan Banner"}
          </Button>

          <Link to="/data">
            <Button variant="primary" size="compact" className="inline-flex items-center gap-1.5">
              <span>Uji Data Layer (/data)</span>
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="compact" className="inline-flex items-center gap-1.5">
              <ArrowLeft16Regular />
              <span>Beranda</span>
            </Button>
          </Link>
        </div>
      </header>
      </div>

      {/* Main Content Showcase */}
      <main className="max-w-341.5 mx-auto p-6 space-y-10 pb-24">
        {/* ============================================================== */}
        {/* SECTION 1: DESIGN.md §2 — TOKEN & TIPOGRAFI                    */}
        {/* ============================================================== */}
        <section id="section-tokens" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                1. Token &amp; Tipografi
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Berdasarkan DESIGN.md §2 &amp; Bandrek DS Spesifikasi #1a
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §2.1–2.4
            </span>
          </div>

          {/* Colors grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Brand & Surface */}
            <div className="p-3 bg-white border border-(--color-border) rounded-lg">
              <div className="text-[11px] font-semibold text-(--color-text-muted) uppercase tracking-wider mb-2">
                Brand &amp; Permukaan
              </div>
              <div className="space-y-1.5 font-mono text-[11.5px]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-brand) flex-none" />
                  <span>brand</span>
                  <span className="ml-auto text-(--color-text-muted)">#0F6CBD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-brand-pressed) flex-none" />
                  <span>brand-pressed</span>
                  <span className="ml-auto text-(--color-text-muted)">#115EA3</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-brand-subtle) border border-(--color-border) flex-none" />
                  <span>brand-subtle</span>
                  <span className="ml-auto text-(--color-text-muted)">#EBF3FC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-surface) border border-(--color-border) flex-none" />
                  <span>surface</span>
                  <span className="ml-auto text-(--color-text-muted)">#FFFFFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-canvas) border border-(--color-border) flex-none" />
                  <span>canvas</span>
                  <span className="ml-auto text-(--color-text-muted)">#F5F5F5</span>
                </div>
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="p-3 bg-white border border-(--color-border) rounded-lg">
              <div className="text-[11px] font-semibold text-(--color-text-muted) uppercase tracking-wider mb-2">
                Warna Semantik (Ultima)
              </div>
              <div className="space-y-1.5 font-mono text-[11.5px]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-success) flex-none" />
                  <span>success</span>
                  <span className="ml-auto text-(--color-text-muted)">#4CAF50</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-warning) flex-none" />
                  <span>warning</span>
                  <span className="ml-auto text-(--color-text-muted)">#F0A82E</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-danger) flex-none" />
                  <span>danger</span>
                  <span className="ml-auto text-(--color-text-muted)">#C50F1F</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-4 rounded-xs bg-(--color-info) flex-none" />
                  <span>info</span>
                  <span className="ml-auto text-(--color-text-muted)">#0F6CBD</span>
                </div>
              </div>
            </div>

            {/* Typography Tokens */}
            <div className="p-3 bg-white border border-(--color-border) rounded-lg col-span-1 md:col-span-2">
              <div className="text-[11px] font-semibold text-(--color-text-muted) uppercase tracking-wider mb-2">
                Tipografi Acuan (DESIGN.md §2.2)
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-title">Judul Halaman</span>
                  <span className="font-mono text-[10.5px] text-(--color-text-muted)">
                    --text-title (22px / 600 / 1.25)
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-section">Judul Bagian &amp; Header Layar</span>
                  <span className="font-mono text-[10.5px] text-(--color-text-muted)">
                    --text-section (18px / 600 / 1.3)
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-card">Judul Kartu &amp; Dialog</span>
                  <span className="font-mono text-[10.5px] text-(--color-text-muted)">
                    --text-card (15px / 600 / 1.4)
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-body">Teks Isi &amp; Isian Form</span>
                  <span className="font-mono text-[10.5px] text-(--color-text-muted)">
                    --text-body (13.5px / 400 / 1.5)
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-table">Baris Tabel (Compact: 12.5px / 400 / 1.4)</span>
                  <span className="font-mono text-[10.5px] text-(--color-text-muted)">
                    --text-table
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-label">LABEL KOLOM TABEL</span>
                  <span className="font-mono text-[10.5px] text-(--color-text-muted)">
                    --text-label (11px / 600 / 1.3, letter-spacing .09em)
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[12px]">
                    08:00–09:30 · 16 Sep 2026 · 1.140 siswa
                  </span>
                  <span className="font-mono text-[10.5px] text-(--color-text-muted)">
                    --text-mono (Cascadia Mono + tabular-nums)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: TOMBOL (BUTTONS)                                    */}
        {/* ============================================================== */}
        <section id="section-buttons" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                2. Tombol (Buttons)
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Semua varian dan state sesuai DESIGN.md §3.1 &amp; Spesifikasi #1b
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.1
            </span>
          </div>

          <div className="bg-white border border-(--color-border) rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-(--color-border-subtle) text-(--color-text-muted) text-[11px]">
                  <th className="py-2 px-3 text-left w-28">Varian</th>
                  <th className="py-2 px-3 text-center">Default</th>
                  <th className="py-2 px-3 text-center">Hover (Simulasi)</th>
                  <th className="py-2 px-3 text-center">Active (Pressed)</th>
                  <th className="py-2 px-3 text-center">Focus</th>
                  <th className="py-2 px-3 text-center">Disabled</th>
                  <th className="py-2 px-3 text-center">Loading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border-subtle)">
                {/* Primary */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-(--color-text)">Primary</td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="primary">Simpan</Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex h-6.5 px-2.5 items-center justify-center rounded-md bg-(--color-brand-pressed) text-white text-[12px] font-semibold">
                      Simpan
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex h-6.5 px-2.5 items-center justify-center rounded-md bg-[#0E4C84] text-white text-[12px] font-semibold translate-y-px">
                      Simpan
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="primary" className="border-black shadow-[inset_0_0_0_1px_#000000,inset_0_0_0_2px_#ffffff]">
                      Simpan
                    </Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="primary" disabled>
                      Simpan
                    </Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="primary" loading>
                      Simpan
                    </Button>
                  </td>
                </tr>

                {/* Secondary */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-(--color-text)">Secondary</td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="secondary">Batal</Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex h-6.5 px-2.5 items-center justify-center rounded-md border border-(--color-border-strong) bg-(--color-surface-alt) text-(--color-text) text-[12px]">
                      Batal
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex h-6.5 px-2.5 items-center justify-center rounded-md border border-[#8A8886] bg-(--color-surface-sunken) text-(--color-text) text-[12px]">
                      Batal
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="secondary" className="border-black shadow-[inset_0_0_0_1px_#000000]">
                      Batal
                    </Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="secondary" disabled>
                      Batal
                    </Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="secondary" loading>
                      Batal
                    </Button>
                  </td>
                </tr>

                {/* Ghost */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-(--color-text)">Ghost</td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="ghost">Lihat</Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex h-6.5 px-2.5 items-center justify-center rounded-md bg-(--color-brand-subtle) text-(--color-brand-ink) text-[12px]">
                      Lihat
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex h-6.5 px-2.5 items-center justify-center rounded-md bg-[#DCE9F9] text-[#0E4C84] text-[12px]">
                      Lihat
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="ghost" className="border-black shadow-[inset_0_0_0_1px_#000000]">
                      Lihat
                    </Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="ghost" disabled>
                      Lihat
                    </Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="ghost" loading>
                      Lihat
                    </Button>
                  </td>
                </tr>

                {/* Danger */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-(--color-text)">Danger</td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="danger">Batalkan</Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex h-6.5 px-2.5 items-center justify-center rounded-md border border-(--color-danger) bg-(--color-danger-bg) text-(--color-danger-ink) text-[12px]">
                      Batalkan
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex h-6.5 px-2.5 items-center justify-center rounded-md border border-[#9B0C18] bg-[#F8D5D8] text-[#7A0912] text-[12px]">
                      Batalkan
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="danger" className="border-black shadow-[inset_0_0_0_1px_#000000] bg-(--color-danger-bg)">
                      Batalkan
                    </Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="danger" disabled>
                      Batalkan
                    </Button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button variant="danger" loading>
                      Batalkan
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Sizes demo */}
            <div className="mt-4 pt-3 border-t border-(--color-border-subtle) flex items-center gap-4 text-[12px]">
              <span className="text-(--color-text-muted) font-medium">Ukuran (Selalu Compact per DESIGN.md §2.4):</span>
              <Button size="compact" variant="primary">
                Compact (26px)
              </Button>
              <Button size="icon" variant="secondary" title="Icon Compact (26px)">
                <LineHorizontal316Regular />
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: ISIAN TEKS, WAKTU, TANGGAL & DROPDOWN               */}
        {/* ============================================================== */}
        <section id="section-inputs" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                3. Isian Teks, Waktu, Tanggal &amp; Dropdown
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Default, hover, fokus brand bottom border 2px, error bottom border 2px, disabled
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.2
            </span>
          </div>

          <div className="bg-white border border-(--color-border) rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Default */}
            <div>
              <FormLabel>Default State</FormLabel>
              <Input defaultValue="Matematika SD" />
            </div>

            {/* Hover Simulation */}
            <div>
              <FormLabel>Hover State</FormLabel>
              <Input defaultValue="Matematika SD" className="border-[#8A8886]" />
            </div>

            {/* Focus State */}
            <div>
              <FormLabel>Focus State (2px Brand Bottom)</FormLabel>
              <Input
                defaultValue="Matematika SD"
                className="border-(--color-brand) shadow-[inset_0_-1px_0_0_var(--color-brand)]"
              />
            </div>

            {/* Placeholder */}
            <div>
              <FormLabel>Placeholder</FormLabel>
              <Input placeholder="Nama kegiatan" />
            </div>

            {/* Disabled */}
            <div>
              <FormLabel>Disabled</FormLabel>
              <Input defaultValue="Matematika SD" disabled />
            </div>

            {/* Error with inline message */}
            <div>
              <FormLabel required error>
                Jam Selesai (Error)
              </FormLabel>
              <TimePicker defaultValue="09:30" error />
              <InlineError message="Jam selesai harus setelah jam mulai. Ubah jam selesai menjadi setelah 08:00." />
            </div>

            {/* Search Input */}
            <div>
              <FormLabel>Search Input (Pencarian)</FormLabel>
              <SearchInput defaultValue="Aisyah" onClear={() => {}} />
            </div>

            {/* Time & Date */}
            <div>
              <FormLabel>Waktu (Jam Tunggal)</FormLabel>
              <TimePicker defaultValue="08:00" />
            </div>

            <div>
              <FormLabel>Tanggal (Date Picker)</FormLabel>
              <DatePicker defaultValue="2026-09-16" />
            </div>

            <div>
              <FormLabel>Rentang Waktu (Mulai – Selesai)</FormLabel>
              <TimeRangePicker defaultStart="08:00" defaultEnd="09:30" />
            </div>

            {/* Standard Select */}
            <div>
              <FormLabel required>Jenis kegiatan</FormLabel>
              <Select defaultValue="">
                <option value="">Pilih jenis kegiatan</option>
                <option value="pembelajaran">Pembelajaran</option>
                <option value="rapat">Rapat</option>
                <option value="olahraga">Olahraga</option>
                <option value="ujian">Ujian</option>
                <option value="konsultasi">Konsultasi</option>
              </Select>
            </div>

            {/* Grouped Ruangan Select (Tanpa Ruangan) */}
            <div>
              <FormLabel>Ruangan</FormLabel>
              <GroupedRuanganSelect
                groups={sampleRuanganGroups}
                defaultValue=""
                allowNone
                noneLabel="Tanpa ruangan"
              />
            </div>

            {/* Grouped Ruangan Select (Terpilih) */}
            <div>
              <FormLabel>Ruangan Terpilih</FormLabel>
              <GroupedRuanganSelect
                groups={sampleRuanganGroups}
                defaultValue="r1"
                allowNone
                noneLabel="Tanpa ruangan"
              />
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: SEGMENTED CONTROL                                   */}
        {/* ============================================================== */}
        <section id="section-segmented" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                4. Segmented Control
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Kehadiran (H/I/S/A) dan Ketuntasan. Mendukung tombol panah &amp; pintasan huruf
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.3
            </span>
          </div>

          <div className="bg-white border border-(--color-border) rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interactive Kehadiran */}
              <div>
                <FormLabel>Kehadiran Siswa (Compact: 26px — Interaktif)</FormLabel>
                <div className="flex items-center gap-3">
                  <KehadiranSegmentedControl
                    value={kehadiranVal}
                    onChange={(val) => setKehadiranVal(val)}
                  />
                  <span className="text-[12px] text-(--color-text-muted)">
                    Pilihan: <strong className="text-(--color-text) capitalize">{kehadiranVal}</strong>
                  </span>
                </div>
              </div>

              {/* Attendance Row Kehadiran (34px) */}
              <div>
                <FormLabel>
                  Baris Realisasi (34px khusus Isi Realisasi per §2.4)
                </FormLabel>
                <KehadiranSegmentedControl
                  size="attendance"
                  value={kehadiranVal}
                  onChange={(val) => setKehadiranVal(val)}
                />
              </div>

              {/* Unselected / Error state */}
              <div>
                <FormLabel error required>
                  Kehadiran Belum Diisi (Error State)
                </FormLabel>
                <KehadiranSegmentedControl
                  value={null}
                  onChange={() => {}}
                  error
                />
                <InlineError message="Isi status kehadiran atau tandai semua hadir." />
              </div>

              {/* Ketuntasan */}
              <div>
                <FormLabel>Ketuntasan Materi</FormLabel>
                <div className="flex items-center gap-3">
                  <KetuntasanSegmentedControl
                    value={ketuntasanVal}
                    onChange={(val) => setKetuntasanVal(val)}
                  />
                  <span className="text-[12px] text-(--color-text-muted)">
                    Status: <strong className="text-(--color-text) capitalize">{ketuntasanVal}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: BLOK KALENDER & 8 PENANDA JENIS                     */}
        {/* ============================================================== */}
        <section id="section-calendar" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                5. Blok Kalender &amp; Penanda Jenis
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Semua 5 status kegiatan ditumpangkan + 8 jenis penanda warna + grup &quot;+N lainnya&quot;
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.4
            </span>
          </div>

          <div className="bg-white border border-(--color-border) rounded-lg p-4 space-y-4">
            <div className="text-[11px] font-semibold text-(--color-text-muted) uppercase tracking-wider">
              Status Kegiatan (Ditumpangkan)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <div className="text-[11px] text-(--color-text-muted) mb-1">Terjadwal</div>
                <CalendarEvent
                  status="terjadwal"
                  jamMulai="08:00"
                  jamSelesai="09:30"
                  judul="Matematika SD"
                  ruangan="R. Melati"
                  jumlahSiswa={8}
                />
              </div>

              <div>
                <div className="text-[11px] text-(--color-text-muted) mb-1">Terealisasi</div>
                <CalendarEvent
                  status="terealisasi"
                  jamMulai="08:00"
                  jamSelesai="09:30"
                  judul="Matematika SD"
                  ruangan="R. Melati"
                  jumlahSiswa={8}
                />
              </div>

              <div>
                <div className="text-[11px] text-(--color-text-muted) mb-1">Belum direalisasi</div>
                <CalendarEvent
                  status="belum"
                  jamMulai="08:00"
                  jamSelesai="09:30"
                  judul="Matematika SD"
                  ruangan="R. Melati"
                  jumlahSiswa={8}
                />
              </div>

              <div>
                <div className="text-[11px] text-(--color-text-muted) mb-1">Dibatalkan (Coret)</div>
                <CalendarEvent
                  status="dibatalkan"
                  jamMulai="08:00"
                  jamSelesai="09:30"
                  judul="Matematika SD"
                  ruangan="R. Melati"
                  jumlahSiswa={8}
                />
              </div>

              <div>
                <div className="text-[11px] text-(--color-text-muted) mb-1">Dijadwal ulang</div>
                <CalendarEvent
                  status="dijadwal-ulang"
                  jamMulai="08:00"
                  jamSelesai="09:30"
                  judul="Matematika SD"
                  ruangan="R. Melati"
                  jumlahSiswa={8}
                />
              </div>

              <div>
                <div className="text-[11px] text-(--color-text-muted) mb-1">Fokus / Terpilih</div>
                <CalendarEvent
                  status="terjadwal"
                  selected
                  jamMulai="08:00"
                  jamSelesai="09:30"
                  judul="Matematika SD"
                  ruangan="R. Melati"
                  jumlahSiswa={8}
                />
              </div>
            </div>

            {/* 8 Jenis Penanda Kegiatan */}
            <div className="text-[11px] font-semibold text-(--color-text-muted) uppercase tracking-wider pt-3 border-t border-(--color-border-subtle)">
              8 Penanda Jenis Kegiatan (DESIGN.md §2.1)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(
                [
                  "pembelajaran",
                  "rapat",
                  "olahraga",
                  "ujian",
                  "kunjungan",
                  "konsultasi",
                  "pelatihan",
                  "lainnya",
                ] as JenisKegiatanKey[]
              ).map((j) => (
                <CalendarEvent
                  key={j}
                  jenis={j}
                  status="terjadwal"
                  jamMulai="08:00"
                  jamSelesai="09:30"
                  judul={j.charAt(0).toUpperCase() + j.slice(1)}
                  ruangan="R. Utama"
                  subjek="Bu Sari"
                />
              ))}
            </div>

            {/* More events indicator */}
            <div className="pt-2 flex items-center gap-4">
              <span className="text-[12px] text-(--color-text-muted)">
                Grup jika slot waktu penuh:
              </span>
              <div className="w-36">
                <MoreEventsGroup count={3} onClick={() => alert("Membuka daftar 3 kegiatan lainnya")} />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 6: SEL MATRIKS BELAJAR                                 */}
        {/* ============================================================== */}
        <section id="section-matrix" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                6. Sel Matriks Belajar
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Semua 7 keadaan sel dari legend matriks sesuai DESIGN.md §3.5 &amp; Spesifikasi #1b
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.5
            </span>
          </div>

          <div className="bg-white border border-(--color-border) rounded-lg p-4">
            <div className="flex items-center gap-6 flex-wrap">
              {(
                [
                  { state: "tersampaikan", label: "Tersampaikan" },
                  { state: "sakit", label: "Sakit" },
                  { state: "izin", label: "Izin" },
                  { state: "alpa", label: "Alpa" },
                  { state: "batal", label: "Batal (Coret)" },
                  { state: "terjadwal", label: "Terjadwal" },
                  { state: "kosong", label: "Belum" },
                ] as { state: MatrixCellState; label: string }[]
              ).map((item) => (
                <div key={item.state} className="flex flex-col items-center gap-1.5">
                  <MatrixCell state={item.state} />
                  <span className="text-[11px] text-(--color-text-muted) whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}

              {/* Focus state */}
              <div className="flex flex-col items-center gap-1.5">
                <MatrixCell state="tersampaikan" className="shadow-[inset_0_0_0_2px_var(--color-focus-ring)] z-10" />
                <span className="text-[11px] text-(--color-text-muted) whitespace-nowrap">
                  Fokus Keyboard
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-(--color-border-subtle) text-[12px] text-(--color-text-secondary)">
              <strong>Aturan cetak:</strong> Sel non-hijau memiliki garis dalam 1px (shadow inset) agar tetap dapat dibedakan saat dicetak hitam-putih.
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 7: TABEL & BARIS KHUSUS                                */}
        {/* ============================================================== */}
        <section id="section-tables" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                7. Tabel &amp; Baris Khusus
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Garis pemisah tipis, tanpa zebra, baris terpilih, baris perlu tindakan (DESIGN.md §3.6)
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.6
            </span>
          </div>

          <div className="bg-white border border-(--color-border) rounded-lg overflow-hidden">
            <Table density="compact">
              <TableHeader>
                <tr>
                  <TableHead className="w-24">Waktu</TableHead>
                  <TableHead>Nama Kegiatan</TableHead>
                  <TableHead>Ruangan</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-24 text-right">Peserta</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {/* Default Row */}
                <TableRow>
                  <TableCell mono>08:00</TableCell>
                  <TableCell>Matematika SD (Default row)</TableCell>
                  <TableCell>R. Melati</TableCell>
                  <TableCell>
                    <KegiatanBadge status="terjadwal" />
                  </TableCell>
                  <TableCell mono alignRight>
                    8 siswa
                  </TableCell>
                </TableRow>

                {/* Hover state simulated */}
                <TableRow className="bg-(--color-surface-alt)">
                  <TableCell mono>09:30</TableCell>
                  <TableCell>B. Indonesia SMP (Hover state)</TableCell>
                  <TableCell>R. Mawar</TableCell>
                  <TableCell>
                    <KegiatanBadge status="terealisasi" />
                  </TableCell>
                  <TableCell mono alignRight>
                    12 siswa
                  </TableCell>
                </TableRow>

                {/* Selected Row */}
                <TableRow selected>
                  <TableCell mono>11:00</TableCell>
                  <TableCell>IPA Intensif (Baris Terpilih · brand-subtle + garis kiri)</TableCell>
                  <TableCell>Lab IPA</TableCell>
                  <TableCell>
                    <KegiatanBadge status="terjadwal" />
                  </TableCell>
                  <TableCell mono alignRight>
                    6 siswa
                  </TableCell>
                </TableRow>

                {/* Warning Row (Perlu Tindakan) */}
                <TableRow warning>
                  <TableCell mono>
                    <span className="inline-flex items-center gap-1 align-middle">
                      <Warning16Regular className="text-(--color-warning-ink) flex-none translate-y-[-0.5px]" />
                      <span>13:00</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    Statistika Dasar (Baris Perlu Tindakan · latar warning penuh)
                  </TableCell>
                  <TableCell>R. Melati</TableCell>
                  <TableCell>
                    <KegiatanBadge status="belum" />
                  </TableCell>
                  <TableCell mono alignRight>
                    10 siswa
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 8: STATUS BADGE, CHIP, SUBJEK & CHECKBOX               */}
        {/* ============================================================== */}
        <section id="section-badges" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                8. Status Badge, Chip, Subjek &amp; Checkbox
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Badge pill dengan glyph, subjek chip dengan popover peran, filter chip, checkbox
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §2.3, §3.7
            </span>
          </div>

          <div className="bg-white border border-(--color-border) rounded-lg p-4 space-y-4">
            {/* Badges */}
            <div>
              <FormLabel>Status Kegiatan &amp; Kehadiran</FormLabel>
              <div className="flex flex-wrap gap-2 pt-1">
                <KegiatanBadge status="terjadwal" />
                <KegiatanBadge status="belum" />
                <KegiatanBadge status="terealisasi" />
                <KegiatanBadge status="dibatalkan" />
                <KegiatanBadge status="dijadwal-ulang" />
                <span className="text-(--color-border) self-center">|</span>
                <KehadiranBadge status="hadir" />
                <KehadiranBadge status="sakit" />
                <KehadiranBadge status="izin" />
                <KehadiranBadge status="alpa" />
                <span className="text-(--color-border) self-center">|</span>
                <MasterStatusBadge status="aktif" />
                <MasterStatusBadge status="nonaktif" />
              </div>
            </div>

            {/* Subjek Chips */}
            <div className="pt-2 border-t border-(--color-border-subtle)">
              <FormLabel>Subjek Chip (Klik nama peran untuk mengganti peran)</FormLabel>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {subjekList.map((s) => (
                  <SubjekChip
                    key={s.id}
                    nama={s.nama}
                    peran={s.peran}
                    isPrimary={s.peran === "Pengisi"}
                    onPeranChange={(newRole) => {
                      setSubjekList(
                        subjekList.map((item) =>
                          item.id === s.id ? { ...item, peran: newRole } : item
                        )
                      );
                    }}
                    onRemove={() => {
                      setSubjekList(subjekList.filter((item) => item.id !== s.id));
                    }}
                  />
                ))}
                <AddSubjekButton
                  onClick={() => {
                    const newId = String(Date.now());
                    setSubjekList([
                      ...subjekList,
                      { id: newId, nama: "Tutor Baru", peran: "Support" },
                    ]);
                  }}
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="pt-2 border-t border-(--color-border-subtle)">
              <FormLabel>Filter Cepat &amp; Filter Aktif</FormLabel>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <FilterChip label="Perlu realisasi" onRemove={() => {}} />
                <FilterChip label="Hari ini" onRemove={() => {}} />
                <FilterChip label="Minggu ini" onRemove={() => {}} />
                <FilterChip label="Pak Dedi" onRemove={() => {}} />
              </div>
            </div>

            {/* Checkbox States */}
            <div className="pt-2 border-t border-(--color-border-subtle)">
              <FormLabel>Checkbox States</FormLabel>
              <div className="flex items-center gap-6 pt-1">
                <Checkbox label="Unchecked" />
                <Checkbox defaultChecked label="Checked" />
                <Checkbox checked="indeterminate" label="Indeterminate" />
                <Checkbox disabled label="Disabled" />
                <Checkbox disabled defaultChecked label="Disabled Checked" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 9: STUDENT CHECKLIST                                   */}
        {/* ============================================================== */}
        <section id="section-checklist" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                9. Student Checklist (Pemilihan Siswa)
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Pencarian instan, pengelompokan per kelas/jenjang, pilih sekelas sekaligus
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              Task Brief Requirement
            </span>
          </div>

          <div className="max-w-140">
            <StudentChecklist
              groups={studentGroups}
              selectedIds={selectedStudentIds}
              onChange={setSelectedStudentIds}
            />
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 10: PERINGATAN BENTROK (P3)                            */}
        {/* ============================================================== */}
        <section id="section-conflict" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                10. Peringatan Bentrok (Pattern P3)
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Peringatan lunak tidak memblokir simpan, 1 baris bukti, 3 jalan keluar
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §4 P3
            </span>
          </div>

          <div className="max-w-155">
            <ConflictWarning
              title="R. Melati sudah dipakai pada jam ini"
              evidence='"IPA Kelas SMP" memakai R. Melati 08:30–10:00 pada Rab, 16 Sep.'
              onHighlightInCalendar={() => {
                showToast({
                  type: "info",
                  message: "Menyorot bentrok di slot kalender Rabu 16 Sep",
                });
              }}
              onChangeRoomOrSubject={() => {
                showToast({
                  type: "info",
                  message: "Fokus dipindahkan ke pemilihan ruangan",
                });
              }}
              onProceedAnyway={() => {
                showToast({
                  type: "warning",
                  message: "Kegiatan disimpan dengan catatan bentrok ruangan",
                });
              }}
            />
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 11: RINGKASAN ERROR & FORM VALIDASI (P2)               */}
        {/* ============================================================== */}
        <section id="section-error-summary" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                11. Ringkasan Error &amp; Form Validasi (Pattern P2)
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Ringkasan di atas form dengan tautan fokus + inline error di bawah isian
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §4 P2
            </span>
          </div>

          <div className="max-w-155">
            <ErrorSummary
              errors={[
                {
                  field: "Jam selesai",
                  message: "harus setelah jam mulai. Ubah jam selesai menjadi setelah 08:00.",
                  onFocusField: () => {
                    showToast({ type: "info", message: "Fokus ke isian Jam Selesai" });
                  },
                },
                {
                  field: "3 siswa",
                  message: "belum punya status kehadiran. Tandai semua hadir atau isi status kehadiran.",
                  onFocusField: () => {
                    showToast({ type: "info", message: "Fokus ke tabel kehadiran" });
                  },
                },
              ]}
            />
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 12: DIALOG KONFIRMASI (P5)                             */}
        {/* ============================================================== */}
        <section id="section-dialog" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                12. Dialog Konfirmasi (Pattern P5)
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Judul pertanyaan, akibat berangka, fokus awal di tombol aman (Tutup)
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.9, §4 P5
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setDialogNonaktifOpen(true)}
            >
              Buka Dialog Nonaktifkan (Primary Action)
            </Button>

            <Button
              variant="danger"
              onClick={() => setDialogBatalOpen(true)}
            >
              Buka Dialog Batalkan Kegiatan (Danger Action)
            </Button>

            <Button
              variant="secondary"
              onClick={() => setConflictModalOpen(true)}
            >
              Buka Modal Konflik Suntingan (B6-konflik)
            </Button>
          </div>

          {/* Dialog 1: Nonaktifkan Siswa */}
          <ConfirmDialog
            open={dialogNonaktifOpen}
            onOpenChange={setDialogNonaktifOpen}
            title="Nonaktifkan siswa ini?"
            consequence="Aisyah Nur tidak lagi muncul saat memilih siswa untuk kegiatan baru. Riwayat dan datanya tetap tersimpan, dan bisa diaktifkan lagi kapan saja."
            summaryObject={{
              title: "Aisyah Nur",
              details: "SD · Kelas SD Sore · bergabung 12 Jan 2026",
            }}
            impactCard={{
              type: "info",
              text: (
                <span>
                  <strong>18 kegiatan</strong> tetap tersimpan dan tetap terhitung di matriks belajar. <strong>2 kegiatan mendatang</strong> yang sudah menyertakan siswa ini tidak berubah.
                </span>
              ),
            }}
            confirmLabel="Nonaktifkan siswa"
            confirmVariant="primary"
            onConfirm={() => {
              showToast({
                type: "success",
                message: "Aisyah Nur dinonaktifkan",
                action: {
                  label: "Urungkan",
                  onClick: () => {
                    showToast({ type: "info", message: "Penonaktifan diurungkan" });
                  },
                },
              });
            }}
          />

          {/* Dialog 2: Batalkan Kegiatan */}
          <ConfirmDialog
            open={dialogBatalOpen}
            onOpenChange={setDialogBatalOpen}
            title="Batalkan kegiatan ini?"
            consequence="Kegiatan tetap tersimpan dan terlihat di kalender dengan tanda dibatalkan. Tidak ada data yang dihapus."
            summaryObject={{
              title: "B. Inggris Kelas SD Sore",
              details: "16 Sep 2026, 08:00–09:30 · R. Melati · Bu Sari",
            }}
            impactCard={{
              type: "warning",
              text: (
                <span>
                  Materi <strong>B. Inggris › Reading</strong> menjadi belum tersampaikan untuk <strong>4 siswa</strong>.
                </span>
              ),
            }}
            confirmLabel="Batalkan kegiatan"
            confirmVariant="danger"
            onConfirm={() => {
              showToast({
                type: "warning",
                message: "Kegiatan dibatalkan",
                action: {
                  label: "Urungkan",
                  onClick: () => {
                    showToast({ type: "info", message: "Pembatalan diurungkan" });
                  },
                },
              });
            }}
          />

          {/* Dialog 3: Konflik Suntingan (B6-konflik) */}
          <SaveConflictModal
            open={conflictModalOpen}
            onClose={() => setConflictModalOpen(false)}
            onUseMine={() => {
              setConflictModalOpen(false);
              showToast({
                type: 'info',
                message: 'Suntingan Anda berhasil disimpan (menimpa versi server).',
              });
            }}
            onUseServer={() => {
              setConflictModalOpen(false);
              showToast({
                type: 'info',
                message: 'Versi tersimpan dari server berhasil dimuat ulang.',
              });
            }}
            onCompare={() => {
              showToast({
                type: 'info',
                message: 'Membuka perbandingan detail versi...',
              });
            }}
          />
        </section>

        {/* ============================================================== */}
        {/* SECTION 13: PANEL SAMPING (SIDE PANEL 498PX)                   */}
        {/* ============================================================== */}
        <section id="section-sidepanel" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                13. Panel Samping (Side Panel)
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Lebar tetap 498px, slide-in animation, konteks kalender tetap terlihat
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.10
            </span>
          </div>

          <div>
            <Button variant="primary" onClick={() => setPanelOpen(true)}>
              Buka Panel Samping Form Kegiatan (498px)
            </Button>
          </div>

          <SidePanel
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
            title="Kegiatan Baru"
            subtitle={<span className="text-(--color-text-muted)">Draf otomatis</span>}
            footer={
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-(--color-text-muted) font-mono">
                  Draf tersimpan 11:42
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setPanelOpen(false);
                      showToast({
                        type: "success",
                        message: "Kegiatan baru berhasil disimpan",
                      });
                    }}
                  >
                    Simpan <span className="font-mono text-[10px] opacity-75 ml-1">Ctrl+S</span>
                  </Button>
                </div>
              </div>
            }
          >
            <div className="space-y-3">
              <div>
                <FormLabel required>Jenis Kegiatan</FormLabel>
                <Select defaultValue="pembelajaran">
                  <option value="pembelajaran">Pembelajaran</option>
                  <option value="rapat">Rapat</option>
                  <option value="ujian">Ujian</option>
                </Select>
              </div>

              <div>
                <FormLabel required>Nama Kegiatan</FormLabel>
                <Input defaultValue="Matematika SD" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel required>Jam Mulai</FormLabel>
                  <Input defaultValue="08:00" />
                </div>
                <div>
                  <FormLabel required>Jam Selesai</FormLabel>
                  <Input defaultValue="09:30" />
                </div>
              </div>

              <div>
                <FormLabel required>Ruangan</FormLabel>
                <GroupedRuanganSelect
                  groups={sampleRuanganGroups}
                  defaultValue="r1"
                />
              </div>

              {/* Conflict warning embedded inside panel form per P3 */}
              <ConflictWarning
                title="R. Melati sudah dipakai pada jam ini"
                evidence='"IPA Kelas SMP" memakai R. Melati 08:30–10:00.'
                onHighlightInCalendar={() => {
                  showToast({ type: "info", message: "Menyorot di kalender..." });
                }}
                onChangeRoomOrSubject={() => {}}
                onProceedAnyway={() => {}}
              />

              <div>
                <FormLabel>Catatan</FormLabel>
                <Textarea placeholder="Catatan internal pengajar..." />
              </div>
            </div>
          </SidePanel>
        </section>

        {/* ============================================================== */}
        {/* SECTION 14: TOAST NOTIFIKASI (P6)                              */}
        {/* ============================================================== */}
        <section id="section-toast" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                14. Toast Notifikasi (Pattern P6)
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Kanan bawah, durasi 5s biasa / 8s bila ada Urungkan / persisten jika error. Maks 3 bertumpuk.
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.8, §4 P6
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                showToast({
                  type: "success",
                  message: "Realisasi disimpan",
                  action: {
                    label: "Lihat detail",
                    onClick: () => alert("Membuka detail realisasi"),
                  },
                });
              }}
            >
              Toast Sukses + Tautan
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                showToast({
                  type: "info",
                  message: "Kegiatan dibatalkan",
                  action: {
                    label: "Urungkan",
                    onClick: () => {
                      showToast({ type: "success", message: "Pembatalan diurungkan" });
                    },
                  },
                });
              }}
            >
              Toast Urungkan (8 detik)
            </Button>

            <Button
              variant="danger"
              onClick={() => {
                showToast({
                  type: "error",
                  message: "Gagal menyimpan realisasi. Sambungan terputus.",
                  action: {
                    label: "Coba lagi",
                    onClick: () => {
                      showToast({ type: "info", message: "Mencoba ulang menyimpan..." });
                    },
                  },
                });
              }}
            >
              Toast Error (Persisten)
            </Button>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 15: EMPTY STATE (P7)                                   */}
        {/* ============================================================== */}
        <section id="section-empty" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                15. Empty State (Tiga Ragam P7)
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                1) Pemakaian pertama, 2) Filter terlalu sempit, 3) Prasyarat belum lengkap. Selalu dua tombol!
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.11, §4 P7
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Pemakaian Pertama */}
            <EmptyState
              icon={<CalendarLtr24Regular className="w-8 h-8 text-(--color-brand)" />}
              title="Belum ada data"
              cause="Belum ada kegiatan. Siapkan data master dulu, lalu jadwal bisa dibuat dalam hitungan detik."
              metaSummary={
                <span className="text-[11.5px] text-(--color-text-muted) flex items-center justify-center gap-1.5">
                  <Checkmark16Regular className="text-(--color-success-ink) flex-none" />
                  <span>48 siswa · 6 subjek · 7 mapel terdaftar</span>
                </span>
              }
              primaryAction={{
                label: "+ Kegiatan baru",
                onClick: () => alert("Buka form kegiatan baru"),
              }}
              secondaryAction={{
                label: "Buka data master",
                onClick: () => alert("Buka menu master"),
              }}
            />

            {/* 2. Filter Terlalu Sempit */}
            <EmptyState
              icon={<Search24Regular className="w-8 h-8 text-(--color-text-muted)" />}
              title="Filter tidak menemukan apa pun"
              cause="Tidak ada kegiatan yang cocok. Tiga filter sedang aktif — longgarkan salah satunya."
              metaSummary={
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <FilterChip label="Ujian" onRemove={() => {}} />
                  <FilterChip label="R. Melati" onRemove={() => {}} />
                </div>
              }
              primaryAction={{
                label: "Reset semua filter",
                onClick: () => alert("Reset filter"),
              }}
              secondaryAction={{
                label: "Perluas ke September",
                onClick: () => alert("Perluas tanggal"),
              }}
            />

            {/* 3. Prasyarat Belum Lengkap */}
            <EmptyState
              icon={<Warning24Regular className="w-8 h-8 text-(--color-warning-ink)" />}
              title="Prasyarat belum lengkap"
              cause="Matriks belum bisa ditampilkan. Seni Budaya belum punya materi, jadi belum ada kolom untuk dibandingkan."
              primaryAction={{
                label: "Tambah materi",
                onClick: () => alert("Buka tambah materi"),
              }}
              secondaryAction={{
                label: "Kembali ke kalender",
                onClick: () => alert("Kembali ke kalender"),
              }}
            />
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 16: POPOVER KONTEKSTUAL                                */}
        {/* ============================================================== */}
        <section id="section-popover" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                16. Popover Kontekstual
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Aksi cepat saat mengklik blok kalender atau sel matriks
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §3.4
            </span>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary">
                  Klik untuk membuka Popover Kegiatan
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 space-y-2">
                <div className="text-[13px] font-semibold text-(--color-text)">
                  Matematika SD
                </div>
                <div className="font-mono text-[11px] text-(--color-text-muted)">
                  08:00–09:30 · R. Melati
                </div>
                <div className="text-[11.5px] text-(--color-text-secondary)">
                  Pengisi: Bu Sari · 8 Siswa
                </div>
                <div className="pt-2 border-t border-(--color-border-subtle) flex items-center justify-between">
                  <Button variant="ghost" size="compact">
                    Detail
                  </Button>
                  <Button variant="primary" size="compact">
                    Isi realisasi
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 17: ATURAN COPY UI & KAMUS AKSI                        */}
        {/* ============================================================== */}
        <section id="section-copy" className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-(--color-border) pb-2">
            <div>
              <h2 className="text-[18px] font-semibold text-(--color-text)">
                17. Aturan Copy UI &amp; Kamus Aksi
              </h2>
              <p className="text-[12px] text-(--color-text-muted)">
                Konsistensi kata dasar dari tombol sampai riwayat (DESIGN.md §5.1)
              </p>
            </div>
            <span className="font-mono text-[10.5px] text-(--color-text-muted)">
              DESIGN.md §5.1
            </span>
          </div>

          <div className="bg-white border border-(--color-border) rounded-lg overflow-hidden">
            <Table density="compact">
              <TableHeader>
                <tr>
                  <TableHead className="w-44">Tombol</TableHead>
                  <TableHead className="w-52">Judul Dialog</TableHead>
                  <TableHead className="w-56">Toast Berhasil</TableHead>
                  <TableHead className="w-48">Status / Badge</TableHead>
                  <TableHead>Riwayat</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold">Simpan</TableCell>
                  <TableCell className="text-(--color-text-muted)">—</TableCell>
                  <TableCell>Perubahan disimpan</TableCell>
                  <TableCell className="text-(--color-text-muted)">—</TableCell>
                  <TableCell>Data diubah</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Simpan realisasi</TableCell>
                  <TableCell className="text-(--color-text-muted)">—</TableCell>
                  <TableCell>Realisasi disimpan</TableCell>
                  <TableCell>
                    <KegiatanBadge status="terealisasi" />
                  </TableCell>
                  <TableCell>Realisasi diisi</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Batalkan kegiatan</TableCell>
                  <TableCell>Batalkan kegiatan ini?</TableCell>
                  <TableCell>Kegiatan dibatalkan</TableCell>
                  <TableCell>
                    <KegiatanBadge status="dibatalkan" />
                  </TableCell>
                  <TableCell>Kegiatan dibatalkan</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Jadwalkan ulang</TableCell>
                  <TableCell>Jadwalkan ulang kegiatan ini?</TableCell>
                  <TableCell>Kegiatan dijadwalkan ulang</TableCell>
                  <TableCell>
                    <KegiatanBadge status="dijadwal-ulang" />
                  </TableCell>
                  <TableCell>Kegiatan dijadwalkan ulang</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Nonaktifkan</TableCell>
                  <TableCell>Nonaktifkan Bu Sari?</TableCell>
                  <TableCell>Bu Sari dinonaktifkan</TableCell>
                  <TableCell>
                    <MasterStatusBadge status="nonaktif" />
                  </TableCell>
                  <TableCell>Subjek dinonaktifkan</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Aktifkan</TableCell>
                  <TableCell className="text-(--color-text-muted)">—</TableCell>
                  <TableCell>Bu Sari diaktifkan</TableCell>
                  <TableCell>
                    <MasterStatusBadge status="aktif" />
                  </TableCell>
                  <TableCell>Subjek diaktifkan</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Urungkan</TableCell>
                  <TableCell className="text-(--color-text-muted)">—</TableCell>
                  <TableCell>Pembatalan diurungkan</TableCell>
                  <TableCell className="text-(--color-text-muted)">
                    kembali ke status sebelumnya
                  </TableCell>
                  <TableCell>Pembatalan diurungkan</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}

