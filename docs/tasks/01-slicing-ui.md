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

