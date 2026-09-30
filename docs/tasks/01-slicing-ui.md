# Task 01 — UI slicing (desktop)

## Goal

Build the full Bandrek desktop UI in `desktop/`, **as close to the prototype as possible**, running against a mock data layer. When this task ends, every screen should look and behave like the prototype, and the only thing missing is a real server.

"As close as possible" means:
- Layout, hierarchy, spacing, and UI copy match the prototype.
- Visual tokens come from `docs/DESIGN.md`. Where the prototype and DESIGN.md differ on style, **DESIGN.md wins**.
- Behavior follows `docs/DOMAIN.md`.

## Scope

- Work only in `desktop/`. Do not touch `server/`, `contract/`, `deploy/`.
- `docs/` is read-only, except where a checkpoint asks you to update the "Progress" section of this file.
- No real API calls, no auth backend. Everything goes through the mock data layer.

## Inputs

- `docs/prototype/` — Claude Design export (source files). Treat as read-only reference.
- `docs/prototype/screenshots/` — screenshots of each screen at 1366×768.
- `docs/design/Bandrek DS Spesifikasi.dc.html` — visual rendering of DESIGN.md. Primary reference for Phase 2.
- `docs/design/Bandrek Hi-Fi Batch B.dc.html` — hi-fi mockups for B1–B6 and special states.
- `docs/DESIGN.md`, `docs/DOMAIN.md`, `docs/ARCHITECTURE.md`.

## Rules for this task

- **Do not port the prototype HTML/JS.** Read it to understand layout, structure, and copy, then build idiomatic React from themed shadcn/ui components.
- **UI components never compute business rules.** Derived status, allowed actions, conflicts, and matrix cell state come from the data layer as ready-to-render fields. Components only render them.
- **Do not invent anything.** If a screen, control, field, or state is not in the prototype or docs, propose it and wait.
- **Conflicts:** if the prototype, DESIGN.md, and DOMAIN.md disagree on anything other than style, stop and ask.
- **Stop at every checkpoint.** Report, then wait for approval before continuing.
- **Commits:** commit only after a checkpoint is approved, one commit per checkpoint. Never push.

---

## Phase 0 — Read and report

Read `AGENTS.md`, `README.md`, all of `docs/`, and the prototype export. Do not write code.

Report:
1. Which screens you found in the prototype (by code A1–A9, B1–B6) and whether each is fully built or a static placeholder. For each B screen, say whether you will follow the prototype or Hi-Fi Batch B.
2. Whether the prototype source is readable. If files are bundled or encoded so the markup can't be read, say so — do not guess from fragments.
3. Whether the prototype can be opened and rendered in a browser for side-by-side comparison.
4. Where the prototype's seed data lives and what shape it has.
5. Every conflict you notice between the prototype, Hi-Fi Batch B, DESIGN.md, DS Spesifikasi, and DOMAIN.md. Include anything in DESIGN.md that assumes the old offline, single-computer design (see ARCHITECTURE.md D5).
7. Screens or states in Hi-Fi Batch B that DOMAIN.md does not mention (for example a profile screen). List them; do not plan to build them yet.
6. Anything in the docs you find ambiguous.

**CHECKPOINT 0** — wait.

## Phase 1 — Scaffold

In `desktop/`:
- Tauri 2 app with the React + TypeScript + Vite template.
- Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod, date-fns — latest stable versions **looked up from the registry**, npm, lockfiles committed. List every package with its installed version in the checkpoint report.
- Version files: `desktop/.nvmrc` (major of the latest Node LTS), `engines.node` in `package.json` plus `engine-strict=true` in `desktop/.npmrc`, and `desktop/src-tauri/rust-toolchain.toml` with `channel = "stable"`.
- Strict TypeScript.
- Fonts from DESIGN.md bundled locally (no CDN). Icon set from DESIGN.md.
- Both `npm run dev` (browser) and `npm run tauri dev` (desktop window) must work.
- Folder structure that separates: design-system components, screens, data layer (interfaces, mock, provisional types), routing.

Then update the "Development" section of `README.md` with the real commands.

**CHECKPOINT 1** — show the folder structure and confirm both run modes work.

## Phase 2 — Tokens and component catalog

- Translate every token in DESIGN.md into CSS variables in `globals.css`, and wire them into the Tailwind theme. Tokens are the single source — no hardcoded colors, sizes, or radii in components.
- Theme the shadcn/ui components with these tokens. The result must look like Bandrek, not like default shadcn.
- Use `docs/design/Bandrek DS Spesifikasi.dc.html` as the visual reference for how each component should look.
- Build a development-only route `/katalog` that shows every component in every state: default, hover, focus, active, disabled, error. Include at least:
  - buttons (all variants), inputs, selects, the grouped ruangan select, date and time inputs, checkboxes
  - subjek chip with role menu, student checklist with search and grouping
  - status badges for kegiatan and for kehadiran
  - calendar event block in every status, plus the "+N lainnya" group
  - every matrix cell state from the legend
  - error summary box, inline error, yellow conflict warning with its actions
  - dialog, side panel, popover, toast, empty state, offline banner
- Every item on `/katalog` must be traceable to a section of DESIGN.md.

**CHECKPOINT 2** — list any DESIGN.md token or component you could not map, and any place where DESIGN.md and the prototype disagree on style. I review `/katalog` before any screen is built. This is the most important checkpoint: if the catalog is right, the screens will be right.

## Phase 3 — Data layer

- Provisional TypeScript types for all entities in `docs/DOMAIN.md`, in one place. They will later be replaced by types generated from the server's OpenAPI contract, so keep names close to the domain.
- One repository interface per resource. Screens and hooks depend only on these interfaces.
- Mock implementation that behaves like the future server:
  - seed ported from the prototype's seed data (same scale: about 80 students, 133 activities)
  - returns server-computed fields: derived status, allowed actions per kegiatan, conflicts, matrix cell state and summaries
  - simulated latency (toggle)
  - error injection (toggle): offline, 401 unauthorized, 409 conflict ("changed by another operator"), update required
- Wire it through TanStack Query.
- Mark the mock's rule logic clearly as disposable. The authoritative version will live on the server.

**CHECKPOINT 3** — show the types, the interfaces, and how a screen will consume them. Wait before building screens.

## Phase 4 — App shell

Navigation rail, routing, layout frame, keyboard shortcuts (Ctrl+N, Ctrl+S, Esc), toast placement, offline banner infrastructure, and the "Perlu realisasi" badge in the rail.

**CHECKPOINT 4.**

## Phase 5 — Screens

Build **one screen per step**, in this order, stopping after each:

1. A2 Kalender (week, day, month views, filters, "+N lainnya")
2. A2 Popover kegiatan
3. A4 Form kegiatan (side panel)
4. A5 Detail kegiatan
5. A6 Batalkan, A7 Jadwal ulang
6. A8 Realisasi
7. A9 Matriks belajar
8. A3 Daftar kegiatan
9. B1 Siswa — establishes the CRUD pattern
10. B2–B6 Remaining master data, using the pattern from B1
11. Client-server screens not in the prototype (DOMAIN.md §13): setup server address, login, user management, offline state, save conflict, update required. First check the special states in Hi-Fi Batch B and reuse whatever fits. **Propose each design first** and wait for approval.

After each screen:
- Open the prototype screen and your implementation side by side at **1366×768**. Take screenshots of both.
- List every visible difference, fix what should match, and report any difference you kept on purpose (with the reason: DESIGN.md wins, DOMAIN.md says otherwise, etc.).
- Check the same screen at 1920×1080.
- Test with the full seed, not a handful of records: long names, busy days, long lists.
- Verify the behaviors listed for that screen in DOMAIN.md.

**CHECKPOINT after every screen.**

## Done when

- Every prototype screen is implemented and matches it, apart from reported and approved differences.
- The client-server screens exist and have been approved.
- `/katalog` covers every component and state used in the app.
- No component computes a business rule.
- `README.md` development commands are accurate.

---

## Progress

_Update this section at each approved checkpoint: what was done, and any decisions made along the way._

- [x] Phase 0 — Read and report
  - Investigated all docs, prototype (`Bandrek Prototipe.dc.html`, `seed.js`, `support.js`), design specs, and Batch B hi-fi.
  - Verified 7 points: all A1–A9 and B1–B6 screens are fully built and interactive in the prototype. B screens follow the prototype per rule.
  - Reported and resolved 3 ambiguity items: reference screenshots verified in `docs/prototype/screenshots/` (25 screenshots), profile screens confirmed, and `support.js` added to `docs/design/`.
  - Confirmed offline-write/sync in DESIGN.md is superseded by ARCHITECTURE.md D5 (online-only, read cache, no offline write/sync).
- [x] Phase 1 — Scaffold
  - Scaffolded Tauri 2 + React 19 + TypeScript + Vite desktop client in `desktop/`.
  - Pinned toolchain and version files: `.nvmrc` (Node 22 LTS), `.npmrc` (`engine-strict=true`), `package.json` (`engines.node = ^22.0.0`), `src-tauri/rust-toolchain.toml` (`channel = "stable"`).
  - Bundled Cascadia Mono font locally (no CDN), configured Fluent System Icons (`@fluentui/react-icons`), Tailwind v4 + design tokens CSS variables.
  - Configured strict TypeScript with path aliases (`@/*`).
  - Established folder structure: `components/ui`, `screens`, `data/{interfaces,mock,types}`, `routes`, `lib`.
  - Verified both run modes (`npm run dev` and `npm run tauri dev` at 1366×768 min window) and clean build (`tsc && vite build`).
  - Updated `README.md` development section.
- [x] Phase 2 — Tokens and component catalog
  - Defined all CSS variables from `DESIGN.md §2` in `desktop/src/index.css` (brand, surface, semantic, status, 8 calendar event types, spacing, radius, border, elevation, motion, typography, density).
  - Implemented full set of Bandrek design system components in `desktop/src/components/ui/`: `button`, `input`, `select`, `checkbox`, `badge`, `segmented-control`, `calendar-event`, `matrix-cell`, `subjek-chip`, `student-checklist`, `conflict-warning`, `error-summary`, `dialog`, `side-panel`, `popover`, `toast`, `empty-state`, `offline-banner`, `table`.
  - Built interactive `/katalog` screen (`desktop/src/screens/KatalogScreen.tsx`) covering every component in all states (default, hover, focus, active, disabled, error/warning, loading) with traceability to sections in `DESIGN.md`.
  - Audited token mapping (100% mapped, 0 unmapped) and resolved style discrepancies where `DESIGN.md` wins over the prototype (control heights 26px/32px/34px, semantic variables, focus ring conventions, and read-only cache offline banner per ARCHITECTURE.md D5).
  - Verified clean TypeScript compilation and production build (`tsc && vite build`).
- [x] Phase 3 — Data layer
  - Defined provisional TypeScript types for all entities in `docs/DOMAIN.md` under `desktop/src/data/types/` (`common`, `master`, `kegiatan`, `realisasi`, `matriks`, `auth`, `simulasi`).
  - Implemented 11 repository interfaces in `desktop/src/data/interfaces/` (`IKegiatanRepository`, `IRealisasiRepository`, `IMatriksRepository`, `ISiswaRepository`, `ISubjekRepository`, `IKelasRepository`, `IMapelRepository`, `ITempatRepository`, `IJenisKegiatanRepository`, `IAuthRepository`, `ISimulasiRepository`).
  - Ported seed data from `docs/prototype/seed.js` into `desktop/src/data/mock/seedData.ts` (80 siswa, 12 subjek, 8 kelas, 6 mapel, 48 materi, 3 tempat, 9 ruangan, 5 jenis, 64 ceklis manual, 133 kegiatan).
  - Implemented server-authoritative mock calculations marked as disposable in `businessRules.ts`: derived status (`belum_direalisasi` for past events), allowed actions per kegiatan, real-time schedule conflict detection on room, subject, and student, 7-state matrix learning grid calculations with priority resolution, and master data delete protection.
  - Implemented network simulation and error injection (`mockRunner.ts`): latency toggle (0ms, 150ms, 500ms, 1000ms) and error injection (`offline`, 401 unauthorized, 409 conflict, 426 update required) with in-memory persistence and reset capabilities.
  - Wired full TanStack Query hooks in `desktop/src/data/hooks/` and registered repository DI container in `repositories.ts`.
  - Built interactive test & inspection screen at `/data` (`DataLayerScreen.tsx`).
  - Verified with 27 integration tests (100% pass) and clean strict TypeScript build (`tsc && vite build`).
- [x] Phase 4 — App shell
  - Implemented 48px/208px collapsible `NavigationRail` with Fluent transition, brand header, primary navigation items (`Alt+1`..`Alt+3`), master data items (`Alt+4`..`Alt+9`), and bottom "Perlu realisasi" badge linked directly to `/kegiatan?filter=perlu_realisasi` with live count from `usePerluRealisasiCount()`.
  - Built 48px sticky `TopBar` with dynamic screen title, Ctrl+K quick search bar, offline read-only mode badge, and "+ Kegiatan baru" primary action button (`Ctrl+N`).
  - Implemented `QuickSearchModal` (`Ctrl+K`) for real-time search across students, subjects, and activities with keyboard navigation (`↑↓`, `Enter`, `Esc`).
  - Implemented global keyboard shortcuts hook (`useGlobalKeyboardShortcuts`) supporting `Ctrl+N` (new kegiatan event), `Ctrl+S` (save event), `Ctrl+B` (toggle rail), `Ctrl+K` (quick search), `Esc` (close panels/modals), and `Alt+1`..`Alt+9` (quick rail routing).
  - Wired dynamic toast repositioning (`offsetRight` in `ToastContext` shifting to 514px when side panels are open to avoid blocking action buttons per DESIGN.md §3.8 & §14).
  - Integrated sticky `OfflineBanner` infrastructure responding to simulator / connection state with retry button.
  - Set up routing in `App.tsx` nesting all core routes (`/kalender`, `/kegiatan`, `/matriks`, and `/master/*`) within `AppShell` with `PlaceholderScreen` displaying live entity counts from TanStack Query.
  - Verified with 31 automated shell tests (100% pass), 27 data layer tests (100% pass), and clean production build (`tsc && vite build`).
- [ ] Phase 5 — Screens
  - [x] Step 1: A2 Kalender (week, day, month views, filters, "+N lainnya")
    - Built pure date math utilities (`desktop/src/lib/dateUtils.ts`) with Monday-based weeks, Cascadia Mono formatting, and Indonesian locale strings.
    - Implemented overlapping cluster layout algorithm (`desktop/src/components/kalender/kalenderLayout.ts`) with min 84px track width and condensation into `+N lainnya` button card when overlapping density exceeds screen width.
    - Implemented calendar state management (`useKalenderState.ts`) supporting view modes (`minggu` default, `hari`, `bulan`), date navigation, mini calendar anchor, filters (jenis, subjek, kelas, ruangan), status toggles, and keyboard shortcut (`T` for today).
    - Built 212px `KalenderSidebar.tsx` with mini calendar, dropdown filters, and 5 status checkboxes with custom glyphs (`·`, `✓`, `⚠`, `↻`, `✕`).
    - Built 44px `KalenderToolbar.tsx` with date range label, count badge, and view segmented control.
    - Built `KalenderGrid.tsx` with 07:00–18:00 time grid (36px slot), 56px left scale, red now line (`11:39`), event blocks styled per `DESIGN.md §3.4` (superimposed status glyphs and left border), and condensed `+N lainnya` card.
    - Built `KalenderMonthView.tsx` with 7-column grid and event chips, plus `KalenderEmptyState.tsx` for zero-result filter states.
    - Verified against reference screenshot `docs/prototype/screenshots/Screenshot.png` (19 activities in week 14–20 Sep 2026, 8 activities at 08:00 on Rabu 16 Sep).
    - Passed all 26 automated calendar tests, 31 shell tests, and 27 data layer tests (84/84 tests passed, 0 TypeScript errors).
   - [x] Step 2: A2 Popover kegiatan
    - Exported `PopoverAnchor` and `PopoverClose` in `desktop/src/components/ui/popover.tsx`.
    - Added `formatTanggalRingkas` in `desktop/src/lib/dateUtils.ts` (e.g. `Rab, 16 Sep 2026`).
    - Implemented `desktop/src/components/kalender/KegiatanPopover.tsx` (340px width, tokens `--shadow-overlay`, `--dur-normal`, `--color-border-strong`).
    - Supported title line-through for cancelled events, official status badge pills with glyphs (`·`, `⚠`, `✓`, `↻`, `✕`), close button (`Tutup · Esc`).
    - Structured metadata rows: Cascadia Mono date/time, jenis label, materi (`Mapel › Materi`), tempat & ruangan, subjek with role chips, expandable student list (capped at 128px max height, scrollable, with jenjang and active/inactive badge).
    - Added cancellation reasons, reschedule reasons, and bidirectional reschedule links (`Pindah ke` / `Pindahan dari`) with navigation.
    - Wired allowed action button footers strictly per server rules (5 actions for `terjadwal`/`belum_direalisasi`, 2 for `terealisasi`, disabled `Isi realisasi` for `dibatalkan`/`dijadwal_ulang`).
    - Integrated clean event-driven popover lifecycle in `KalenderScreen.tsx` with key-based unmount/remount (0 `useEffect` state sync loops).
    - Verified with 14 automated popover tests (98/98 tests passed across test suite, 0 TypeScript errors).
  - [x] Step 3: A4 Form kegiatan (side panel)
    - Implemented 498px side panel `desktop/src/components/kegiatan/FormKegiatanPanel.tsx` with light scrim overlay (`rgba(36,36,36,0.18)`), smooth slide-in motion, and sticky header/footer per `DESIGN.md §3.10`.
    - Header: Dynamic title (`Kegiatan baru` / `Ubah kegiatan`), context slot pill (e.g. `Rab, 16 Sep · 08:00`), `Riwayat perubahan` link in edit mode, and close button with `Esc` shortcut.
    - Dynamic fields: Nama kegiatan, Jenis kegiatan with `materiWajib` & `siswaWajib` guidance notes, Tanggal picker (Cascadia Mono), Mulai & Selesai 5-minute stepper with `selesai > mulai` validation, Ruangan grouped by Tempat with room capacity, cascading Mapel & Materi dropdowns, Subjek chips with role selector popover (`Pengisi`, `Pendamping`, `Pengganti`, `Support`) and "+ tambah" popover with uniqueness constraints.
    - Siswa selection: Header count `Siswa · N dipilih *`, "+ Dari kelas" batch importer with duplicate skipping and removable origin chips, inline search box, "Pilih semua yang tampil", "Kosongkan", grouped student checkboxes with jenjang and class labels.
    - Conflict warning: Real-time conflict detection via TanStack Query query hooks with 3 interactive action buttons ("Sorot di kalender", "Pilih ruangan lain / Ubah jam", "Simpan tetap").
    - Soft validation: ErrorSummary box and inline errors only display after first save attempt (`dicoba = true`) or blur (`touched`), Save button remains active initially per `DOMAIN.md §5`.
    - Footer: Autosave draft timestamp (`Draf disimpan HH:mm`), "Batal", "Simpan & buat lagi" (preserves jenis, ruangan, subjek, mapel, tanggal per DOMAIN.md §5), "Simpan" (`Ctrl+S`).
    - Dialog confirmation: Intercepts `Esc`, backdrop click, and "Batal" when form is dirty to prevent accidental data loss.
    - Dynamic toast repositioning: Integrates with `ToastContext` shifting offset right to 514px when panel is open.
    - Verified against prototype screenshot `docs/prototype/screenshots/Screenshot_5.png` at 1366×768 and 1920×1080.
    - Passed all 6 automated form tests (100%), 14 popover tests, 31 shell tests, and 27 data layer tests (104/104 tests passed, 0 TypeScript errors, 0 lint warnings).
  - [x] Step 4: A5 Detail kegiatan (read-only view)
    - Implemented read-only detail view `desktop/src/screens/DetailKegiatanScreen.tsx` on route `/kegiatan/:id` inside `AppShell`.
    - Top Toolbar (H: 44px): Navigation breadcrumb with `[<]` button, source screen link (`Kalender` / `Daftar kegiatan` via location state), `›`, activity title (with `line-through` and muted styling for cancelled events), official status badge pill (`●`, `⚠`, `✓`, `↻`, `✕`).
    - Header Actions: Disabled "Cetak" button with "Cetak menyusul di tahap berikutnya" title tooltip, Primary action button ("Ubah kegiatan" opens `FormKegiatanPanel` in edit mode; "Ubah realisasi" triggers realisasi view; disabled with `cursor-not-allowed` for cancelled / rescheduled activities), and `···` extra actions dropdown menu ("Jadwalkan ulang", "Batalkan kegiatan" in red `#9B0C18`).
    - Kartu 1 (RENCANA): Two-column layout displaying Waktu (Cascadia Mono), Tempat (`Tempat · Ruangan`), Subjek (`Nama (Peran)`), Catatan rencana, Jenis kegiatan, Materi (`Mapel › Materi`), Kelas, and cancellation/reschedule reason details when present.
    - Kartu 2 (REALISASI):
      - If realisasi exists: Green border (`#4CAF50`, bg `#F6FBF7`) with header `diisi <nama> · <waktu>`, actual time with Cascadia Mono timestamps and delay/early indicator (`(mulai telat N mnt)` / `(mulai lebih awal N mnt)` / `(sesuai rencana)`), actual topic with concordance indicator (`(sesuai rencana)` vs `(berbeda dari rencana)`), realisasi catatan, student presence summary (`N hadir · N izin · N sakit · N alpa` or `Tanpa siswa`), and ketuntasan status.
      - If realisasi is empty: Amber warning box (`#FFF3E0`, border `#F0A82E`, icon `⚠`) with status-dependent explanation and action buttons (`[Isi realisasi]` and `[Ubah kegiatan]`).
    - Kartu 3 (PESERTA): Header count `PESERTA · N SISWA` (or `TANPA SISWA`) and status subtitle; sticky table header (`NAMA`, `JENJANG`, `KEHADIRAN`, `CATATAN`), scrollable table body with max height 288px (`max-h-72`), presence badge pills with glyphs and colors matching DESIGN.md, and descriptive empty state message for activities without students (e.g. meetings/training).
    - Right Sidebar (330px fixed width):
      - RIWAYAT KEGIATAN: Vertical timeline with colored status dots (`Realisasi diisi` [green], `Kegiatan dibatalkan` [red], `Kegiatan dijadwalkan ulang` [purple], `Dibuat dari penjadwalan ulang` [blue], `Kegiatan dibuat` [gray]) and Cascadia Mono timestamps.
      - KEGIATAN TERKAIT: Bidirectional links to reschedule source/destination and up to 3 activities sharing the same mapel & kelas, navigable directly to `/kegiatan/:id`.
    - Full Integration: Direct launch of `FormKegiatanPanel` in edit mode when "Ubah kegiatan" is clicked, updating data seamlessly; wired `QuickSearchModal` and `KalenderScreen` to navigate to `/kegiatan/:id` with back-navigation state; Esc key shortcut handling.
    - Passed all 5 automated detail kegiatan tests (100%), 6 form tests, 14 popover tests (100%), with `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 5: A6 Batalkan kegiatan & A7 Jadwal ulang
    - Implemented A6 modal dialog `desktop/src/components/kegiatan/BatalkanKegiatanModal.tsx` (520px max width per prototype line 2607):
      - Header: title "Batalkan kegiatan ini?" with consequence explanation ("Kegiatan tetap tersimpan dan terlihat di kalender dengan tanda dibatalkan. Tidak ada data yang dihapus.").
      - Activity summary card: activity name, Cascadia Mono date/time, subject & student count summary.
      - Mandatory reason selection: dropdown from dynamic `useAlasanBatal()` with inline error handling ("Pilih alasan pembatalan...").
      - Optional notes textarea.
      - Impact warning box: amber warning box (`#FFF3E0`, border `#F0A82E`, text `#8A5200`) detailing unlearned materials in matriks belajar + "Lihat matriks" navigation button (or neutral notice for activities without students).
      - Checkbox "Sekalian jadwalkan ulang": chains immediately into A7 Jadwal Ulang modal upon confirmation.
      - Action buttons: safe "Tutup" button focused on open; danger "Batalkan kegiatan" button (red `#9B0C18`).
    - Implemented A7 modal dialog `desktop/src/components/kegiatan/JadwalUlangModal.tsx` (744px max width per prototype line 2656):
      - Two-column layout: Left column "JADWAL LAMA" (read-only old activity card with `line-through` time, mandatory reason selection from `useAlasanJadwalUlang()`, notes textarea, "Bawa serta subjek, siswa, materi, dan catatan rencana" checkbox default true with sub-caption).
      - Right column "JADWAL BARU": Cascadia Mono date picker, 5-minute step time inputs with `selesai > mulai` order validation, grouped Ruangan select with room capacities.
      - Availability preview (PRATINJAU KETERSEDIAAN): dynamic 4-hour slot preview around start time displaying conflict status (`slot dipilih · bebas`, `bentrok`, or `<Ruangan> terisi`), and subject concurrent schedule conflict card (green `✓ Semua subjek bebas...` or amber `⚠ <Subjek> sudah punya kegiatan...`).
      - Footer: dynamic outcome summary (`Hasil: 1 kegiatan ditandai dijadwal ulang...`), "Batal", and "Jadwalkan ulang" primary button.
    - Integration:
      - Connected popover actions in `KalenderScreen.tsx` ("Batalkan kegiatan" and "Jadwalkan ulang").
      - Connected `···` menu actions in `DetailKegiatanScreen.tsx` ("Batalkan kegiatan" and "Jadwalkan ulang").
      - Chained flow: Batalkan with "Sekalian jadwalkan ulang" opens Jadwal Ulang modal with `dariBatal = true` (preserving dibatalkan status on origin per DOMAIN.md §8).
    - Passed all 5/5 automated Step 5 test suites (100%), 5 detail tests, 6 form tests, 14 popover tests (100%), with `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 6: A8 Realisasi kegiatan
    - Implemented full-screen realization workflow `desktop/src/screens/RealisasiScreen.tsx` on route `/kegiatan/:id/realisasi` inside `AppShell`.
    - Top Toolbar (H: 44px): Navigation breadcrumb with `[<]` button, source screen link (`Kalender` / `Kegiatan`), screen title (`Isi realisasi` / `Ubah realisasi`), official status badge pill with delay indicator (`⚠ Belum direalisasi · telat N hari`), pending realization counter link (`N kegiatan lain menunggu`), secondary `[Simpan draf]` button, and primary `[Simpan realisasi Ctrl S]` / `[Simpan perubahan Ctrl S]` button.
    - Kartu Rencana (Read-Only): 3-column layout displaying Nama & Waktu with Cascadia Mono timestamps and place/room (`Rencana: Sab, 22 Agu 2026 · 07:00–09:00 · Cabang Utara › Lap. Utama`), `RENCANA MATERI`, and `SUBJEK` with roles.
    - Actual Time Controls:
      - `Jam mulai aktual *` and `Jam selesai aktual *` with Cascadia Mono formatting and 5-minute stepping.
      - Duration indicator (`N mnt`) and delta pill (`mulai telat N mnt` / `mulai N mnt lebih awal`).
      - Checkbox `[x] Sama dengan rencana`: synchronizes actual times to planned schedule and disables manual inputs.
      - Time order validation (`selesai > mulai`).
    - Actual Materi & Ketuntasan (for kinds with `materiWajib`):
      - Dropdown `Materi yang benar-benar disampaikan *` filtered by mapel.
      - Discrepancy warning box (`⚠ Berbeda dari rencana... Matriks belajar akan mencatat materi ini...`).
      - Segmented control `Ketuntasan materi *`: `[Tuntas]`, `[Sebagian]`, `[Tidak]`.
    - Combined Kehadiran Container:
      - Kehadiran Siswa Section: Header count `KEHADIRAN · N SISWA`, `[Tandai semua hadir]` button, `[Kosongkan]` button, live status counts (`N hadir · N izin · N sakit · N alpa · N belum diisi`), sticky table header (`# | NAMA | JENJANG | KEHADIRAN * | CATATAN SISWA`), and scrollable body (`data-rel-scroll="siswa"`).
      - **CRITICAL DOMAIN RULE**: Default presence starts completely empty (`{}`), **NEVER pre-filled with Hadir**.
      - Row error highlights with inset red indicator and warning banner upon attempted submission.
      - Kehadiran Subjek Section: Header count `KEHADIRAN SUBJEK · N ORANG`, `[Tandai semua hadir]` button, status counts, sticky header (`# | NAMA | PERAN | KEHADIRAN * | KETERANGAN`), and scrollable body (`max-h-46.5`).
      - Descriptive empty states for events without students (e.g. meetings) or subjects.
    - Right Sidebar (310px fixed width):
      - `CATATAN KEGIATAN` textarea (`Apa yang benar-benar terjadi di sesi ini`).
      - `TINDAK LANJUT` section: "Buat kegiatan lanjutan untuk materi yang belum tuntas" checkbox (available when ketuntasan is `sebagian` or `tidak`), chaining into `BANDREK_EVENTS.NEW_KEGIATAN` with prefilled follow-up context.
      - Dynamic bottom status box: amber warning card (`⚠ Belum lengkap`) detailing missing items vs green success card (`✓ Siap disimpan`) when all requirements are met.
    - Draft & Persistence:
      - `Simpan draf`: stores state in `sessionStorage` (`bandrek:realisasi:draft:${id}`) with last saved timestamp, leaving activity in current status.
      - `Simpan realisasi`: validates all fields, auto-focuses/scrolls to first error if incomplete, calls `useSimpanRealisasi()` mutation, updates activity to `terealisasi`, invalidates caches, and shows success toast with `Lihat detail` action.
      - Unsaved discard protection: `<ConfirmDialog>` intercepts `Esc` and back navigation when form is dirty.
    - Integration:
      - Wired `handleOpenRealisasi` in `KalenderScreen.tsx` popover to `/kegiatan/:id/realisasi`.
      - Wired `handleIsiRealisasi` and `handleUtamaClick` ("Ubah realisasi") in `DetailKegiatanScreen.tsx` to `/kegiatan/:id/realisasi`.
      - Wired `handleGlobalNew` in `KalenderScreen.tsx` to accept custom event payload for automated follow-up activity creation.
    - Verified with 6/6 automated realisasi tests, 5/5 batal & jadwal ulang tests, 5/5 detail tests, 6/6 form tests, 14/14 popover tests (100% pass), and `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 7: A9 Matriks belajar
    - Implemented full matrix view `desktop/src/screens/MatriksScreen.tsx` on route `/matriks` inside `AppShell`.
    - Top Subheader (H: 44px): caption "apa yang sudah dan belum diterima tiap siswa", "Ceklis massal" mode toggle button, disabled "Cetak" and "Ekspor CSV" buttons with tooltips per `DOMAIN.md §10` and `DESIGN.md`.
    - Filter Toolbar (H: 48px, bg `#FAFAFA`, border-b `#E1DFDD`):
      - Mandatory single-select Mapel and Jenjang dropdown selectors on far left, persisted across session via `sessionStorage` (`bandrek:matriks:mapel`, `bandrek:matriks:jenjang`).
      - Default mapel: first active mapel (Matematika); default jenjang: jenjang with most active students (SD with 31 active students).
      - Additional filters: Kelas (filtered by active jenjang), search student input, "Reset filter" button, "Tampilkan siswa nonaktif" checkbox (default unchecked), "Tandai siswa tertinggal" checkbox (default checked).
    - 4 Summary Cards (`desktop/src/components/matriks/MatriksSummaryCards.tsx`):
      1. CAKUPAN MATERI: percentage and ratio (e.g. `17%`, `31 dari 186 sel tersampaikan`).
      2. SISWA TERTINGGAL: count and threshold (`31 dari 31`, `≥ 3 dari 6 materi belum diterima` with amber background `#FFF3E0`, border `#F0A82E`, text `#8A5200`).
      3. MATERI PALING TERTINGGAL: dynamic tiebreaker (paling banyak belum -> paling lama tidak dijadwalkan -> urutan materi, e.g. `Perkalian · belum diterima 31 dari 31 siswa`).
      4. MENUNGGU REALISASI: un-realized activity count (`8 kegiatan · angka di atas bisa berubah`).
    - Anomaly Banner & Modal (`MatriksAnomalyBanner.tsx` and `MatriksAnomalyModal.tsx`):
      - Amber banner when students have records (presence in kegiatan or manual checklist) for topics outside their jenjang (`7 siswa punya catatan Matematika di luar jenjang SD — biasanya salah input saat memilih materi.`).
      - 620px modal dialog detailing the 7 anomaly records with direct navigation to the activity on click.
    - Matrix Grid Table (`desktop/src/components/matriks/MatriksGrid.tsx`):
      - Sticky student column on left (width 260px) with warning glyph `⚠` and amber highlight for tertinggal students, line-through and "nonaktif" chip for inactive students.
      - Sticky top header (H: 34px) with material titles.
      - Sticky right column (W: 62px) displaying completed ratio per student (`1/6`, `2/6`).
      - Sticky bottom summary row (H: 26px) displaying "MENERIMA" metric with Cascadia Mono ratio per material (`14/31`, `0/31` in red `#9B0C18`).
      - 7 canonical cell states with full priority resolution per DOMAIN.md §10 (`tersampaikan / selesai_manual > terjadwal > alpa > izin > sakit > kosong`).
    - Cell Popover (`desktop/src/components/matriks/MatriksCellPopover.tsx`):
      - 360px popover anchored to clicked cell.
      - Header: student name, jenjang, mapel › materi, status pill badge.
      - Section "KEGIATAN TERKAIT": list of related activities with presence and ketuntasan pills, clickable to navigate to activity.
      - Section "Tandai sudah dipelajari": explanatory note if already tersampaikan, or checkbox with optional date picker and notes for manual checklist with audit trail.
    - Bulk Checklist Mode (`desktop/src/components/matriks/MatriksBulkToolbar.tsx`):
      - Interactive multi-cell, full-row (via student name), and full-column (via column header) selection.
      - Bulk action toolbar with date picker, shared notes input, "Lepas ceklis", "Tandai sudah dipelajari" (skipping cells already tersampaikan), and "Selesai".
    - Legend Bar (`desktop/src/components/matriks/MatriksLegendBar.tsx`):
      - 7 canonical state badges with exact styling from DESIGN.md §3.5 and prototype.
    - Prerequisite Empty State (`desktop/src/components/matriks/MatriksEmptyState.tsx`):
      - Informative zero-states when no topics exist for jenjang or when filters match zero students.
    - Verified with 7/7 automated tests in `desktop/scripts/test-matriks.mjs` and `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 8: A3 Daftar kegiatan
    - Implemented full activity list view `desktop/src/screens/DaftarKegiatanScreen.tsx` on route `/kegiatan` inside `AppShell`.
    - Filter Toolbar (`desktop/src/components/daftar/DaftarToolbar.tsx`):
      - Date range picker `dari` and `sampai` with Cascadia Mono timestamps and popover calendar; disabled with tooltip `title="Rentang tanggal diabaikan selama filter cepat aktif"` when quick filter is active.
      - Default date range: 2 weeks before simulated today (`02/09/2026`) to latest date in seed dataset (`11/10/2026`).
      - Dropdown selectors: `Jenis: semua` (with kinds list), `Status: semua` (with 5 statuses), `Subjek: semua` (with active subjects), `Kelas: semua` (with classes).
      - Inline text search `Cari nama kegiatan` (width 158px).
      - Disabled `Ekspor CSV` button with tooltip `title="Ekspor CSV menyusul di tahap berikutnya"`.
    - Quick Filters Bar (`desktop/src/components/daftar/DaftarQuickFilters.tsx`):
      - `Filter cepat` label.
      - 4 quick chips with Cascadia Mono counts matching prototype `Screenshot_13.png`:
        - `[⚠ Perlu realisasi 8]` (amber highlight `#FFF3E0`, border `#F0A82E`, text `#8A5200`, warning icon `⚠`, dismiss button `✕`).
        - `[Hari ini 9]` (blue highlight when active).
        - `[Minggu ini 19]`.
        - `[Akan datang 53]`.
      - Integrated with NavigationRail `Perlu Realisasi` badge: navigating via `?filter=perlu_realisasi` activates `perlu` chip immediately.
      - `Reset filter` button (visible when any filter or search is active).
      - Summary indicator on the right: `Menampilkan X dari 133 kegiatan · urut terbaru dulu / urut terlama dulu`.
    - Activity List Table (`desktop/src/components/daftar/DaftarTable.tsx`):
      - Sticky table header (H: 26px, bg `#FAFAFA`, border-b `#E1DFDD`, font 10.5px bold): `TANGGAL ↓/↑`, `JAM`, `NAMA KEGIATAN`, `JENIS`, `MATERI`, `RUANGAN`, `PENGISI`, `SISWA`, `STATUS`, `AKSI`.
      - Interactive sort toggle on `TANGGAL` (toggles newest first `↓` vs oldest first `↑`, with secondary sort by `mulai`).
      - Rows: 32px height, hover `#FAFAFA`, amber background `#FFF8EE` with `box-shadow: inset 3px 0 0 #F0A82E` for activities requiring realization.
      - Date: Cascadia Mono `Sel, 15 Sep`, brand blue `#0C548F` when `tanggal === today`.
      - Name: bold for `perluRealisasi`, line-through and muted `#5C5A58` for `dibatalkan`. Clickable to navigate to `/kegiatan/:id` with state `{ from: 'daftar' }`.
      - Status Badge Pills: glyph and color styling matching DESIGN.md and prototype (`⚠ Belum · 1 hari`, `⚠ Belum · 5 hari`, `● Terjadwal`, `✓ Terealisasi`, `↻ Dijadwal ulang`, `✕ Dibatalkan`).
      - Action Buttons per status (DOMAIN.md §3 & prototype):
        - `terjadwal` & `belum_direalisasi`: Primary `[Isi realisasi]` button, `[↻]` reschedule button, `[✕]` cancel button.
        - `terealisasi`: Primary `[Ubah realisasi]` button.
        - `dibatalkan` & `dijadwal_ulang`: `[Lihat detail]` ghost button.
      - Sticky Bottom Bar (H: 30px, bg `#FAFAFA`, border-t `#E1DFDD`): displays date range summary or quick filter note (`8 kegiatan sudah lewat tapi belum direalisasi — rentang tanggal diabaikan selama filter ini aktif`), and truncation warning if > 300 rows.
    - Zero State Display (`desktop/src/components/daftar/DaftarEmptyState.tsx`):
      - Filtered empty state: `Tidak ada kegiatan yang cocok` with active filter count and `[Lepas semua filter]` / `[Reset semua filter]`.
      - Empty date range state: `Belum ada kegiatan di rentang ini` with `[Kegiatan baru]` and `[Lebarkan rentang setahun]`.
    - Modal & Panel Integration:
      - Wired `BatalkanKegiatanModal` (A6) and `JadwalUlangModal` (A7) with chaining support.
      - Wired `FormKegiatanPanel` (A4) listening to `BANDREK_EVENTS.NEW_KEGIATAN` (Ctrl+N or TopBar button) and empty state.
    - Verified with 7/7 automated tests in `desktop/scripts/test-daftar-kegiatan.mjs` and `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 9: B1 Siswa — establishes the Master Data CRUD pattern (P1) & Profil Siswa
    - Implemented master-detail CRUD pattern (P1) with side-by-side table and 380px edit panel (`desktop/src/screens/SiswaScreen.tsx`) on route `/master/siswa` and `/master/siswa/:id`.
    - Toolbar & Filter Bar (`desktop/src/components/master/siswa/SiswaToolbar.tsx`):
      - Top Meta Bar (H: 44px): dynamic count `70 aktif · 10 nonaktif`, disabled `Impor CSV` button (`title="Impor CSV menyusul di tahap berikutnya"`), primary `+ Siswa baru` button (`title="Tambah siswa baru · Ctrl+N"`).
      - Filter Bar (H: ~48px, bg `#FAFAFA`, border-b `#E1DFDD`): search input `Cari nama siswa` (by name, school, wali), `Jenjang` dropdown (`Semua`, `SD`, `SMP`, `SMA`), `Kelas` dropdown (`Semua`, `Belum punya`, + list of classes), `Status` dropdown (`Aktif` [default], `Nonaktif`, `Semua`), `Reset filter` button.
    - Master Table (`desktop/src/components/master/siswa/SiswaTable.tsx`):
      - Sticky header (H: 26px, bg `#FAFAFA`, border-b `#E1DFDD`, font 10.5px bold): `NAMA ↑/↓` (interactive sort toggle), `JNJ` (52px), `LAHIR` (86px), `ASAL SEKOLAH` (flex-1 min 110px), `WALI` (118px), `WHATSAPP` (118px), `KEG` (40px, text-right), `STATUS` (74px).
      - 32px row height with hover `#FAFAFA`, selected state `#EBF3FC` with `box-shadow: inset 3px 0 0 #0F6CBD`.
      - Inactive students styled with muted text `#5C5A58` and `line-through`.
      - Click on row selects student and opens/updates right side panel in edit mode.
      - Click on student name text specifically navigates to full `Profil Siswa` view (`/master/siswa/:id` or inline profile mode).
      - Status Badge Pills: `Aktif` (`#E8F5E9`, border `#4CAF50`, text `#2E7D32`) and `Nonaktif` (`#F5F5F5`, border `#C8C6C4`, text `#5C5A58`).
      - Sticky footer (H: 30px, bg `#FAFAFA`, border-t `#E1DFDD`): `Menampilkan X dari 80 siswa · siswa nonaktif disembunyikan`.
    - Empty State (`desktop/src/components/master/siswa/SiswaEmptyState.tsx`):
      - Informative empty display with glyph `◇`, clear cause explanation, `[Tampilkan semua status]` and `[Reset filter]` or `[+ Siswa baru]`.
    - Side Panel Form (`desktop/src/components/master/siswa/SiswaFormPanel.tsx`):
      - 380px fixed width, background `#FAFAFA`, sticky header and footer.
      - Header: dynamic initials avatar circle, title (`Siswa baru` / student name), subtitle (`Isi data dasarnya, lalu simpan` / `<jenjang> · <kelas> · bergabung <tanggal>`), status pill (`Belum disimpan`, `Aktif`, `Nonaktif`).
      - Soft validation (DOMAIN.md §12 & prototype): ErrorSummary box and inline errors only display after first save attempt (`dicoba = true`).
      - Fields:
        - `Nama lengkap *` with duplicate name check across dataset.
        - `Tanggal lahir *` with Cascadia Mono date picker, popover calendar, and live age indicator (e.g. `13 tahun`).
        - `Jenis kelamin` segmented control (`[Laki-laki]` `[Perempuan]`).
        - `Jenjang *` dropdown selector with amber warning box if switching jenjang on existing student (`Memindahkan <nama> dari <lama> ke <baru> mengganti kolom materi yang berlaku untuknya di matriks belajar...`).
        - `Tanggal bergabung` with Cascadia Mono date picker, default today.
        - `Asal sekolah` text input.
        - `Nama wali` and `No. WhatsApp` with Cascadia Mono and regex format check.
        - `Kelas yang diikuti` removable chips + `+ tambah kelas` popover dropdown with available classes for student's jenjang.
        - `Catatan` textarea.
        - `RINGKASAN` card in edit mode: activity and checklist counts + `Lihat kegiatannya di daftar kegiatan` direct link.
      - Footer:
        - `Nonaktifkan` / `Aktifkan kembali` button with toast and `Urungkan` action.
        - `Hapus` button: strictly follows DOMAIN.md §12 rule (disabled if student has any usage in activities, classes, or manual checklists, with descriptive usage tooltip directing user to `Nonaktifkan`; enabled only when 100% unused).
        - `Batal` and `Simpan siswa` / `Simpan` primary button (`Ctrl+S`).
    - Confirmation Modal Dialog (`desktop/src/components/master/siswa/SiswaConfirmModal.tsx`):
      - 460px modal dialog for deactivate and delete actions with consequence explanation and numeric impact bullets.
    - Full Student Profile View (`desktop/src/components/master/siswa/ProfilSiswaView.tsx` - Screenshot_17.png):
      - Top Bar: breadcrumb `< Siswa › [Inisial] Nama [Status] Jenjang · Kelas`, `Cetak rapor kegiatan` (info toast), `Ubah data` (switches to table edit panel).
      - 4 KPI cards: `KEGIATAN DIIKUTI`, `KEHADIRAN (%)`, `CAKUPAN MATERI (%)`, `MATERI TERLEWAT`.
      - Left column: `RIWAYAT KEGIATAN` table with sticky header, quick filters (`Semua`, `Tidak hadir`, `Mapel` dropdown), presence badge pills, and student individual notes.
      - Right column: `CAKUPAN MATERI PER MATA PELAJARAN` progress bars with fractional numbers (e.g. `4/6`), and `MATERI TERLEWAT` cards with direct `jadwalkan susulan` link (`BANDREK_EVENTS.NEW_KEGIATAN`).
    - Data Layer & Business Rules:
      - Enriched `Siswa` entity in `MockSiswaRepository` with server-computed usage statistics (`jumlahKegiatan`, `jumlahKelas`, `jumlahCeklis`, `dapatDihapus`, `alasanTidakBisaHapus`, `rincianPenggunaan`, `ringkasanPenggunaan`).
      - Added `getProfil(id)` in `MockSiswaRepository` computing KPIs, attendance ratios, topic coverage %, and missed topics so UI components never compute business rules.
      - Added `ubahAnggota(kelasId, siswaId, tambah)` in `MockKelasRepository` and `useUbahAnggotaKelas()` hook.
    - Verified with 6/6 automated tests in `desktop/scripts/test-siswa.mjs` and `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 10: B2 Subjek — Master Subjek & Profil Subjek (P1 CRUD Pattern)
    - Implemented Master Subjek table view, 380px edit panel, confirmation modal, and Profil Subjek view (`desktop/src/screens/SubjekScreen.tsx`) on route `/master/subjek` and `/master/subjek/:id`.
    - Toolbar & Filter Bar (`desktop/src/components/master/subjek/SubjekToolbar.tsx`):
      - Top Meta Bar (H: 44px): count e.g. `11 aktif · 1 nonaktif`, primary `+ Subjek baru` button with `title="Tambah subjek baru · Ctrl+N"`.
      - Filter Bar (H: 48px, bg `#FAFAFA`, border-b `#E1DFDD`): search input `Cari nama subjek` (by name, contact), `Peran` dropdown (`Semua`, `Pengisi`, `Pendamping`, `Wali`, `Support`), `Status` dropdown (`Aktif` [default], `Nonaktif`, `Semua`), `Reset filter` button.
    - Master Table (`desktop/src/components/master/subjek/SubjekTable.tsx`):
      - Sticky header (H: 26px, bg `#FAFAFA`, border-b `#E1DFDD`, font 10.5px bold): `NAMA LENGKAP` (210px), `KELAMIN` (92px), `PERAN` (104px), `MATA PELAJARAN` (flex-1 min 110px), `KONTAK` (126px, mono), `KEGIATAN` (74px, mono, right), `STATUS` (78px).
      - 32px row height with hover `#FAFAFA`, selected state `#EBF3FC` with `box-shadow: inset 3px 0 0 #0F6CBD`.
      - Inactive subjects styled with muted text `#5C5A58` and `line-through`.
      - Row click selects subject and opens side panel in edit mode; clicking name text navigates directly to Profil Subjek (`/master/subjek/:id`).
      - Sticky footer (H: 30px, bg `#FAFAFA`, border-t `#E1DFDD`): `Menampilkan X dari Y subjek` (+ ` · subjek nonaktif disembunyikan`).
    - Empty State (`desktop/src/components/master/subjek/SubjekEmptyState.tsx`):
      - Informative empty display with glyph `◇`, clear cause explanation, and primary action (`[Tampilkan semua status]` and `[Reset filter]` or `[+ Subjek baru]`).
    - Side Panel Form (`desktop/src/components/master/subjek/SubjekFormPanel.tsx`):
      - 380px fixed width, background `#FAFAFA`, sticky header and footer.
      - Header: dynamic initials avatar circle in purple `#F3EFFA` text `#5B4394`, title (`Subjek baru` / subject name), subtitle (`Isi nama dan perannya, lalu simpan` / `<peran> · <kelamin> · <kegiatan> kegiatan`), status pill (`Belum disimpan`, `Aktif`, `Nonaktif`).
      - Soft validation (DOMAIN.md §12 & prototype): ErrorSummary box and inline errors only display after first save attempt (`dicoba = true`).
      - Fields:
        - `Nama lengkap *` with duplicate check across other subjects.
        - Two-column row: `Jenis kelamin` segmented toggle (`[Laki-laki]` `[Perempuan]`, click again to clear) and `Peran bawaan` select (`Pengisi`, `Pendamping`, `Wali`, `Support`).
        - `Kontak` text input with Cascadia Mono.
        - `Mata pelajaran yang diampu`: removable chips + `+ tambah` popover with available subjects not yet selected, plus guidance note.
        - `RINGKASAN` card in edit mode: activity count summary + direct link `Lihat kegiatannya di daftar kegiatan` (`/kegiatan?subjek=<id>`).
      - Footer:
        - `Nonaktifkan` / `Aktifkan kembali` button with toast and `Urungkan` action.
        - `Hapus` button: strictly follows DOMAIN.md §12 rule (disabled if subject is involved in any activities, with tooltip explaining usage and directing to `Nonaktifkan`; active only when 0 activities).
        - `Batal` and `Simpan subjek` / `Simpan` primary button (`Ctrl+S`).
    - Confirmation Modal Dialog (`desktop/src/components/master/subjek/SubjekConfirmModal.tsx`):
      - 460px modal dialog for deactivate and delete actions with consequence explanation and numeric impact bullets.
    - Full Subject Profile View (`desktop/src/components/master/subjek/ProfilSubjekView.tsx`):
      - Top Bar: breadcrumb `< Subjek › [Inisial] Nama [Status] Peran · Mapel`, `Lihat di kalender` (`/kalender?subjek=<id>`), `Ubah data` (switches to table edit panel).
      - 4 KPI cards: `KEGIATAN BULAN INI`, `JAM MENGAJAR`, `REALISASI TERTUNDA` (amber highlight + direct link to oldest pending realization), `KETEPATAN JADWAL` (on-time % or `—`).
      - Left column:
        - `BEBAN PER MINGGU · BULAN TAHUN` with comfort limit note `batas nyaman 10 jam/minggu`, weekly progress bars, warning badge `⚠` and note if > 10 hours.
        - `KEGIATAN TERDEKAT` table: sticky header `WAKTU`, `KEGIATAN`, `PERAN`, `STATUS` with delay badges for overdue realizations.
      - Right column:
        - `DATA SUBJEK` card: `Peran bawaan`, `Jenis kelamin`, `Kontak` (mono), `Mata pelajaran`.
        - `KETERSEDIAAN RUTIN` card: daily schedule manager with Hari (`Senin`..`Minggu`), Dari (`HH:mm`), Sampai (`HH:mm`), and Hapus button. `Tambah jadwal` button. Explanatory text if empty.
        - Overdue warning box (amber `#FFF3E0`) if pending realizations exist: `N realisasi menunggu diisi` with `Isi realisasi sekarang` button.
        - `Nonaktifkan subjek` / `Aktifkan kembali subjek` toggle link.
    - Data Layer & Business Rules:
      - Enriched `Subjek` entity in `MockSubjekRepository` with server-computed usage statistics (`jumlahKegiatan`, `dapatDihapus`, `alasanTidakBisaHapus`, `rincianPenggunaan`, `ringkasanPenggunaan`).
      - Added `getProfil(id)` in `MockSubjekRepository` computing 4 KPIs, weekly workload buckets with comfort limits, nearby activities, and routine availability.
      - Added `tambahKetersediaan`, `ubahKetersediaan`, and `hapusKetersediaan` in `MockSubjekRepository` and mutation hooks in `useMaster.ts`.
    - Verified with 6/6 automated tests in `desktop/scripts/test-subjek.mjs` and `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 10: B3 Kelas — Master Kelas & Detail/Form View (P1 Wide Master Pattern)
    - Implemented wide master pattern with left table (288px) and right form area (flex-1) (`desktop/src/screens/KelasScreen.tsx`) on route `/master/kelas` and `/master/kelas/:id`.
    - Toolbar & Filter Bar (`desktop/src/components/master/kelas/KelasToolbar.tsx`):
      - Top Meta Bar (H: 44px): count e.g. `8 kelas · 96 keanggotaan`, primary `+ Kelas baru` button with `title="Tambah kelas baru · Ctrl+N"`.
      - Filter Bar (H: 48px, bg `#FAFAFA`, border-b `#E1DFDD`): search input `Cari nama kelas` (by class name, notes), `Jenjang` dropdown (`Semua`, `SD`, `SMP`, `SMA`), `Reset filter` button.
    - Master Table (`desktop/src/components/master/kelas/KelasTable.tsx`):
      - Sticky header (H: 26px, bg `#FAFAFA`, border-b `#E1DFDD`, font 10.5px bold): `NAMA KELAS` (min-w 120px), `JENJANG` (66px), `SISWA` (54px, mono, right).
      - 32px row height with hover `#FAFAFA`, selected state `#EBF3FC` with `box-shadow: inset 3px 0 0 #0F6CBD`.
      - 0-member warning highlighted in bold amber `#8A5200`.
      - Row click navigates to `/master/kelas/:id`.
      - Sticky footer (H: 30px, bg `#FAFAFA`, border-t `#E1DFDD`): `Menampilkan X dari Y kelas`.
    - Empty State (`desktop/src/components/master/kelas/KelasEmptyState.tsx`):
      - Informative empty display with glyph `◇`, clear cause explanation, and primary action (`[Reset filter]` or `[+ Kelas baru]`).
    - Wide Form Panel (`desktop/src/components/master/kelas/KelasFormView.tsx`):
      - Flexible wide right panel (`flex-1`, background `#FFFFFF`).
      - Header: initials avatar square in blue `#EBF3FC` text `#0C548F`, title (`Kelas baru` / class name), subtitle (`Isi datanya, lalu simpan` / `<jenjang> · <N> anggota · <kegiatan> kegiatan`).
      - Soft validation (DOMAIN.md §12 & prototype): ErrorSummary box and inline errors only display after first save attempt (`dicoba = true`).
      - Fields:
        - `Nama kelas *` with duplicate check across other classes.
        - `Jenjang *` segmented control (`[SD]` `[SMP]` `[SMA]`).
        - `Keterangan` optional text input.
        - `Anggota · N siswa`:
          - Header action `+ Tambah siswa` opens candidate search popover.
          - Candidate search popover with live name search `Cari siswa [jenjang]`, active students matching class jenjang not yet members, sorted alphabetically.
          - Member list (max-h 206px scrollable): student name, inactive badge `nonaktif` (gray) or mismatch jenjang badge (amber), remove button `[✕]`.
          - Explanatory note below member list: `(N anggota di luar jenjang kelas (tetap boleh). ) Mengeluarkan anggota tidak menghapus riwayat kehadirannya.` / `Kelas kosong tetap bisa disimpan dan diisi nanti.`.
        - Info Card `KELAS ITU PINTASAN`:
          - `Mengubah anggota kelas tidak mengubah kegiatan yang sudah dibuat — kelas hanya dipakai saat "+ Dari kelas" di form kegiatan. Satu siswa boleh ada di beberapa kelas.`
        - `RINGKASAN` card in edit mode: activity count summary + direct link `Lihat kegiatannya di daftar kegiatan` (`/kegiatan?kelas=<id>`).
      - Footer:
        - `Hapus` button: strictly follows DOMAIN.md §12 rule (disabled if class is directly imported as source in activities, with tooltip `Tidak bisa dihapus: dipakai sebagai sumber impor di X kegiatan. Ubah dulu kegiatan itu.`; enabled when 0 direct activities).
        - `Batal` and `Simpan kelas` / `Simpan` primary button (`Ctrl+S`).
    - Confirmation Modal Dialog (`desktop/src/components/master/kelas/KelasConfirmModal.tsx`):
      - 460px modal dialog for class deletion with consequence explanation and numeric impact bullets.
    - Data Layer & Business Rules:
      - Enriched `Kelas` entity in `MockKelasRepository` with server-computed usage statistics (`jumlahSiswa`, `jumlahKegiatan`, `jumlahKegiatanLangsung`, `dapatDihapus`, `alasanTidakBisaHapus`, `rincianPenggunaan`, `ringkasanPenggunaan`).
      - Enriched deletion logic: direct import tag checks (`kegDirect === 0`).
      - Enriched `ubahAnggota(kelasId, siswaId, tambah)` and CRUD operations.
    - Verified with 6/6 automated tests in `desktop/scripts/test-kelas.mjs` and `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 10: B4 Mata Pelajaran & Materi — Master-Detail & Child Entity Reordering (P1)
    - Implemented wide parent-child master pattern (`desktop/src/screens/MapelScreen.tsx`) on route `/master/mapel` and `/master/mapel/:id`.
    - Toolbar & Filter Bar (`desktop/src/components/master/mapel/MapelToolbar.tsx`):
      - Top Meta Bar (H: 44px): count e.g. `6 mata pelajaran · 6 aktif`, primary `+ Mapel baru` button with `title="Tambah mata pelajaran baru · Ctrl+N"`.
      - Filter Bar (H: 48px, bg `#FAFAFA`, border-b `#E1DFDD`): search input `Cari mata pelajaran`, `Status` dropdown (`Semua`, `Aktif` [default], `Nonaktif`), `Reset filter` button.
    - Master Table (`desktop/src/components/master/mapel/MapelTable.tsx`):
      - Sticky header (H: 26px, bg `#FAFAFA`, border-b `#E1DFDD`, font 10.5px bold): `MATA PELAJARAN` (min-w 150px), `MATERI` (74px, mono, right).
      - 32px row height with hover `#FAFAFA`, selected state `#EBF3FC` with `box-shadow: inset 3px 0 0 #0F6CBD`.
      - 0-materi warning highlighted in bold amber `#8A5200` with `⚠` icon prefix.
      - Nonaktif suffix ` · nonaktif` and muted text for inactive subjects.
      - Bottom warning alert box when any subject has 0 topics: `⚠ <nama> belum punya materi, jadi belum muncul di matriks belajar.`.
      - Row click navigates to `/master/mapel/:id`.
      - Sticky footer (H: 30px, bg `#FAFAFA`, border-t `#E1DFDD`): `Menampilkan X dari Y mata pelajaran` (+ ` · nonaktif disembunyikan`).
    - Empty State (`desktop/src/components/master/mapel/MapelEmptyState.tsx`):
      - Informative zero-state display with glyph `◇` and primary action (`[Reset filter]` or `[+ Mapel baru]`).
    - Child Materi Table (`desktop/src/components/master/mapel/MateriTable.tsx`):
      - Embedded in parent edit panel.
      - Section header: `MATERI · N · URUTAN = KOLOM MATRIKS` + `+ Materi` button.
      - Sticky header: Drag handle spacer, `NO` (mono right), `NAMA MATERI`, `JENJANG`, `DIPAKAI` (mono right), `STATUS` (pill), and action `[Ubah]`.
      - HTML5 drag & drop reordering with dynamic drop indicator bar, plus keyboard `ArrowUp` / `ArrowDown` support.
      - Explanatory note: `Urutan materi di sini menentukan urutan kolom di matriks belajar.`.
    - Wide Form Panel (`desktop/src/components/master/mapel/MapelFormView.tsx`):
      - Dual-mode panel supporting Parent Mapel view and Child Materi view with back navigation button `[<]`.
      - Parent Mapel mode:
        - `Nama mata pelajaran *` with duplicate check.
        - Switch `aktif`: `Aktif — muncul di form kegiatan dan matriks belajar`.
        - Child `MateriTable` list with live count and direct editing.
        - `RINGKASAN` card: activity count summary + direct link `Lihat kegiatannya di daftar kegiatan` (`/kegiatan?mapel=<id>`).
        - Footer: `Nonaktifkan` / `Aktifkan kembali`, `Hapus` (disabled if has children or activities), `Batal`, `Simpan mata pelajaran` / `Simpan` (`Ctrl+S`).
      - Child Materi mode:
        - Header with `[<]` back button to parent Mapel.
        - `Nama materi *` with uniqueness check among siblings.
        - `Berlaku untuk jenjang *`: multi-select segmented buttons `[SD]` `[SMP]` `[SMA]` (requires ≥ 1) with guidance note.
        - Switch `aktif`: `Aktif — jadi kolom di matriks belajar`.
        - `RINGKASAN` card: activity count summary.
        - Footer: `Nonaktifkan` / `Aktifkan kembali`, `Hapus` (disabled if used in activities), `Batal` (returns to parent), `Simpan materi` / `Simpan` (`Ctrl+S`).
    - Confirmation Modal Dialog (`desktop/src/components/master/mapel/MapelConfirmModal.tsx`):
      - 460px modal dialog supporting deactivate and delete operations for both Mapel and Materi.
    - Data Layer & Business Rules:
      - Enriched `MataPelajaran` and `Materi` entities with server-computed usage statistics (`jumlahMateri`, `jumlahKegiatan`, `dapatDihapus`, `alasanTidakBisaHapus`, `rincianPenggunaan`, `ringkasanPenggunaan`).
      - Deletion integrity: Mapel deletion restricted if child topics exist or activities reference it; Materi deletion restricted if activities reference it.
      - Enriched `getAll(filter)`, `reorderMateri(mapelId, orderedIds)`, and CRUD operations.
    - Verified with 6/6 automated tests in `desktop/scripts/test-mapel.mjs` and `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 10: B5 Tempat & Ruangan — Wide Master-Detail & Child Entity Capacity (P1)
    - Implemented wide parent-child master pattern (`desktop/src/screens/TempatScreen.tsx`) on route `/master/tempat` and `/master/tempat/:id`.
    - Toolbar & Filter Bar (`desktop/src/components/master/tempat/TempatToolbar.tsx`):
      - Top Meta Bar (H: 44px): count e.g. `3 tempat · 9 ruangan`, primary `+ Tempat baru` button with `title="Tambah tempat baru · Ctrl+N"`.
      - Filter Bar (H: 48px, bg `#FAFAFA`, border-b `#E1DFDD`): search input `Cari tempat`, `Reset filter` button.
    - Master Table (`desktop/src/components/master/tempat/TempatTable.tsx`):
      - Sticky header (H: 26px, bg `#FAFAFA`, border-b `#E1DFDD`, font 10.5px bold): `TEMPAT` (min-w 140px), `RUANGAN` (74px, mono, right).
      - 32px row height with hover `#FAFAFA`, selected state `#EBF3FC` with `box-shadow: inset 3px 0 0 #0F6CBD`.
      - 0-ruangan warning highlighted in bold amber `#8A5200` with `⚠` icon prefix.
      - Bottom warning alert box when any tempat has 0 rooms: `⚠ <nama> belum punya ruangan, jadi belum bisa dipilih di form kegiatan.`.
      - Row click navigates to `/master/tempat/:id`.
      - Sticky footer (H: 30px, bg `#FAFAFA`, border-t `#E1DFDD`): `Menampilkan X dari Y tempat`.
    - Empty State (`desktop/src/components/master/tempat/TempatEmptyState.tsx`):
      - Informative zero-state display with glyph `◇` and primary action (`[Reset filter]` or `[+ Tempat baru]`).
    - Child Ruangan Table (`desktop/src/components/master/tempat/RuanganTable.tsx`):
      - Embedded in parent edit panel.
      - Section header: `RUANGAN · N` + `+ Ruangan` button.
      - Compact room row with room name, capacity (`kapasitas N orang`), activity count (`N kegiatan`), and edit button `[Ubah]`.
      - Guidance note: `Ruangan muncul dikelompokkan per tempat di form kegiatan.`.
    - Wide Form Panel (`desktop/src/components/master/tempat/TempatFormView.tsx`):
      - Dual-mode panel supporting Parent Tempat view and Child Ruangan view with back navigation button `[<]`.
      - Parent Tempat mode:
        - `Nama tempat *` with duplicate check across other places.
        - Child `RuanganTable` list with live count and direct editing.
        - `RINGKASAN` card: activity count summary + direct link `Lihat kegiatannya di daftar kegiatan` (`/kegiatan?tempat=<id>`).
        - Footer: `Hapus` (disabled if has children or activities), `Batal`, `Simpan tempat` / `Simpan` (`Ctrl+S`).
      - Child Ruangan mode:
        - Header with `[<]` back button to parent Tempat.
        - `Nama ruangan *` with uniqueness check among sibling rooms.
        - `Kapasitas` number input (Cascadia Mono, default 12, min 1) with guidance: `Dipakai sebagai peringatan lembut saat peserta kegiatan melebihi daya tampung.`.
        - `RINGKASAN` card: activity count summary.
        - Footer: `Hapus` (disabled if used in activities), `Batal` (returns to parent), `Simpan ruangan` / `Simpan` (`Ctrl+S`).
    - Confirmation Modal Dialog (`desktop/src/components/master/tempat/TempatConfirmModal.tsx`):
      - 460px modal dialog supporting delete operations for both Tempat and Ruangan with impact bullets.
    - Data Layer & Business Rules:
      - Enriched `Tempat` and `Ruangan` entities with server-computed usage statistics (`jumlahRuangan`, `jumlahKegiatan`, `dapatDihapus`, `alasanTidakBisaHapus`, `rincianPenggunaan`, `ringkasanPenggunaan`).
      - Deletion integrity (DOMAIN.md §12): Tempat deletion restricted if child rooms exist or activities reference it; Ruangan deletion restricted if activities reference it.
      - Enriched `getAll(filter)` and CRUD operations in `MockTempatRepository`.
    - Verified with 5/5 automated tests in `desktop/scripts/test-tempat.mjs` and `npm run build` passing with 0 errors and 0 lint warnings.
  - [x] Step 10: B6 Jenis Kegiatan — Color Picker & Required Flags (P1 Master Pattern)
    - Implemented master pattern with flexible left table (`flex: 1`) and 352px right form sidebar (`desktop/src/screens/JenisKegiatanScreen.tsx`) on route `/master/jenis` and `/master/jenis/:id`.
    - Toolbar & Filter Bar (`desktop/src/components/master/jenis/JenisToolbar.tsx`):
      - Top Meta Bar (H: 44px): count e.g. `5 jenis kegiatan`, primary `+ Jenis baru` button with `title="Tambah jenis kegiatan baru · Ctrl+N"`.
      - Filter Bar (H: 48px, bg `#FAFAFA`, border-b `#E1DFDD`): search input `Cari nama jenis kegiatan`, `Reset filter` button.
    - Master Table (`desktop/src/components/master/jenis/JenisTable.tsx`):
      - Sticky header (H: 26px, bg `#FAFAFA`, border-b `#E1DFDD`, font 10.5px bold): `JENIS KEGIATAN` (min-w 140px, flex 1), `MATERI` (104px), `SISWA` (100px), `KEGIATAN` (84px, mono, right).
      - 32px row height with hover `#FAFAFA`, selected state `#EBF3FC` with `box-shadow: inset 3px 0 0 #0F6CBD`.
      - Color dot swatch (9x9 rounded-xs) corresponding to the calendar block color token.
      - Inline interactive toggle pills for `MATERI` (`wajib` / `opsional`) and `SISWA` (`wajib` / `opsional`) with toast and `Urungkan` support.
      - Activity count in monospace right-aligned.
      - Row click navigates to `/master/jenis/:id`.
      - Sticky footer (H: 30px, bg `#FAFAFA`, border-t `#E1DFDD`): `Menampilkan X dari Y jenis kegiatan`.
    - Empty State (`desktop/src/components/master/jenis/JenisEmptyState.tsx`):
      - Informative zero-state display with glyph `◇` and primary action (`[Reset filter]` or `[+ Jenis baru]`).
    - Form Sidebar Panel (`desktop/src/components/master/jenis/JenisFormView.tsx`):
      - Fixed 352px width right sidebar with sticky header and footer.
      - Header: dynamic initials avatar square with color token bg & ink, title (`Jenis kegiatan baru` / type name), subtitle (`Isi datanya, lalu simpan` / `${labelWarna} · ${nKegiatan} kegiatan`).
      - Soft validation (DOMAIN.md §12 & prototype): ErrorSummary box and inline errors only display after first save attempt (`dicoba = true`).
      - Fields:
        - `Nama jenis *` with duplicate check across other types.
        - `Warna di kalender`: 5-color palette pills (`Biru` [pembelajaran], `Ungu` [rapat], `Hijau` [olahraga], `Merah` [ujian], `Abu` [lainnya]) with color swatches and explanation note.
        - `Wajib pilih mata pelajaran & materi` toggle card with guidance: `Kalau dimatikan, kegiatan jenis ini tidak masuk hitungan matriks belajar.`.
        - `Wajib pilih siswa peserta` toggle card with guidance: `Rapat dan sejenisnya biasanya dimatikan — cukup subjek saja.`.
        - `RINGKASAN` card in edit mode: activity count summary + direct link `Lihat kegiatannya di daftar kegiatan` (`/kegiatan?jenis=<id>`).
      - Footer:
        - `Hapus` button: strictly follows DOMAIN.md §12 rule (disabled if activity type has any usage in activities, with tooltip `Tidak bisa dihapus: N kegiatan menunjuk jenis kegiatan ini. Ubah dulu kegiatan itu.`; enabled when 0 activities).
        - `Batal` and `Simpan jenis kegiatan` / `Simpan` primary button (`Ctrl+S`).
    - Confirmation Modal Dialog (`desktop/src/components/master/jenis/JenisConfirmModal.tsx`):
      - 460px modal dialog for delete action with consequence explanation and numeric impact bullets.
    - Data Layer & Business Rules:
      - Enriched `JenisKegiatan` entity in `MockJenisKegiatanRepository` with server-computed usage statistics (`jumlahKegiatan`, `dapatDihapus`, `alasanTidakBisaHapus`, `rincianPenggunaan`, `ringkasanPenggunaan`).
      - Deletion integrity (DOMAIN.md §12): restricted if activities reference it.
      - Enriched `getAll(filter)` and CRUD operations in `MockJenisKegiatanRepository`.
    - Verified with 6/6 automated tests in `desktop/scripts/test-jenis.mjs` and `npm run build` passing with 0 errors and 0 lint warnings.




