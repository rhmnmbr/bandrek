# Architecture & decisions

Decision log. Each entry records what was decided and why. When a decision changes, mark the old entry **Superseded** and add a new one — do not delete history.

## System decisions

**D1 — Desktop client: Tauri 2 on Windows.**
React + TypeScript + Vite inside WebView2. The Rust side stays thin: window, auto-updater, secure token storage. No business logic in Rust.

**D2 — Backend: ASP.NET Core 10 (LTS) Minimal APIs, EF Core 10 + Npgsql, PostgreSQL.**
.NET 10 is the latest stable LTS (supported until late 2028). .NET 11 is not used until it is stable.

**D3 — Hosting: Ubuntu VPS on the internet.**
Docker Compose runs the API and PostgreSQL. Caddy is the reverse proxy with automatic HTTPS, so a domain is required. PostgreSQL is reachable only on the internal Docker network, never publicly. Prefer a VPS region in Indonesia (latency and data protection — see D12).

**D4 — Tenancy: one bimbel per deployment.**
No tenant column in the schema. If Bandrek is later sold to other bimbel, each customer gets its own instance (same code, own database). Consequences that apply from day one:
- Nothing about the bimbel is hardcoded — name, logo, domain, timezone come from deployment configuration.
- The server address is entered in the client on first launch, so one installer serves every customer.
- Server setup, migrations, and backups are scripted in `deploy/` and runnable with one command each.

**D5 — Connectivity: online-only, with a read cache.**
The client persists its TanStack Query cache so the last loaded data (today's calendar, matrix, details) stays viewable when the connection drops. All write actions are disabled while offline, with a clear banner. **No offline writes or sync:** conflict detection needs live data from other operators, and two offline operators booking the same room cannot be reconciled sensibly.

**D6 — Business rules are server-authoritative.**
The server computes and returns: derived status (e.g. *Belum direalisasi*), allowed actions per kegiatan, schedule conflicts, and matrix cell state. The client validates **form shape only** (required fields, end time after start time). Reason: with several operators, a rule computed on the client from cached data can be stale and wrong.

**D7 — API contract via OpenAPI.**
The server generates its OpenAPI document at build time into `contract/openapi.json`, which is committed so every API change is visible as a diff. The client generates TypeScript types and TanStack Query hooks from it with Orval. A breaking API change becomes a compile error in the client.

**D8 — Authentication: ASP.NET Core Identity with bearer tokens.**
Login is rate-limited. The client stores tokens in OS secure storage, never in localStorage. Multiple operator accounts; an admin creates operator accounts.

**D9 — Concurrent edits: optimistic concurrency.**
EF Core uses PostgreSQL's `xmin` system column as the concurrency token. When a save is rejected because someone else changed the record, the client shows that the data was changed by another operator and offers to reload.

**D10 — Versioning and updates.**
The Tauri auto-updater is mandatory. The server rejects clients below its minimum supported version with an "update required" response, and the client shows a clear message. Releases are tagged per component: `desktop-vX.Y.Z`, `server-vX.Y.Z`.

**D11 — One repository.**
`desktop/`, `server/`, `contract/`, `deploy/`, `docs/` in one repo, so an API change, the regenerated contract, and the client fix land in one commit. CI uses path filters: the Tauri build runs on Windows, the server build on Linux.

**D12 — Personal data.**
Bandrek stores data about minors (names, birth dates, guardians' WhatsApp numbers). Under Indonesia's personal data protection law, children's data is a specific category with heavier obligations, and hosting location affects cross-border transfer rules. Must be checked before real data is stored. Backups go off the VPS and restores are tested.

**D13 — Versions and toolchain.**
Always the latest **stable** release of every library, framework, and toolchain; never pre-release. Versions are looked up from the registry, not assumed. Upgrades are deliberate, tested, and committed separately — lockfiles make every build reproducible between upgrades.

Toolchain versions are pinned in tool-agnostic version files, so any developer can use whatever version manager they like (fnm, nvm, Volta, or a direct install):

| Toolchain | File | Content |
|---|---|---|
| Node.js | `desktop/.nvmrc` | Major number of the latest LTS line. Bumped deliberately when a new LTS arrives |
| Node.js (enforced) | `desktop/package.json` → `engines.node` + `desktop/.npmrc` → `engine-strict=true` | `npm install` fails on the wrong Node version |
| Rust | `desktop/src-tauri/rust-toolchain.toml` | `channel = "stable"` |
| .NET SDK | `server/global.json` | Latest .NET 10 SDK, `rollForward: latestFeature` |

How a particular machine activates these versions (shell setup for a version manager) is personal configuration and never goes in the repo.

## Desktop client stack

| Concern | Choice |
|---|---|
| Framework | React + TypeScript + Vite |
| Styling | Tailwind CSS; tokens from `docs/DESIGN.md` as CSS variables in `globals.css` |
| Components | shadcn/ui, themed by the Bandrek tokens — never the default shadcn look |
| Routing | React Router |
| Server state | TanStack Query, cache persisted for offline viewing |
| Forms | React Hook Form + Zod (form-shape validation only) |
| Dates | date-fns with the `id` locale, week starts Monday |
| Week calendar, matrix | Custom components — no calendar or grid library |
| Icons, fonts | As specified in `docs/DESIGN.md`; fonts bundled locally, no CDN |

## Client data layer

- One **repository interface** per resource (kegiatan, realisasi, matriks, siswa, subjek, kelas, mapel, tempat, jenis kegiatan, auth). UI code depends only on these interfaces.
- **Mock implementation** (development only, used during slicing): a fake server backed by seed data ported from the prototype. It returns data shaped like the future API, including server-computed fields (derived status, allowed actions, conflicts, matrix cell state). It can simulate latency and errors: offline, 401 unauthorized, 409 conflict, update required.
- **HTTP implementation** (later): built on the Orval-generated client.
- Types used during slicing are **provisional** and live in one place. They will be replaced by the generated types.
- The rule logic inside the mock is disposable. The authoritative version will be written in C# on the server.

## Not in scope

- Offline writes and sync (D5)
- Multi-tenancy inside one database (D4)
- Recurring activities — see `docs/OPEN-QUESTIONS.md`
