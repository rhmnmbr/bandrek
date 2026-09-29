import fs from 'node:fs';
import path from 'node:path';
import { BANDREK_EVENTS } from '../src/lib/keyboardShortcuts.ts';
import { repositories } from '../src/data/repositories.ts';

async function runShellTests() {
  console.log('=== STARTING APP SHELL (PHASE 4) VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Verify existence of required layout components
  const requiredFiles = [
    'src/components/layout/NavigationRail.tsx',
    'src/components/layout/TopBar.tsx',
    'src/components/layout/QuickSearchModal.tsx',
    'src/components/layout/AppShell.tsx',
    'src/lib/keyboardShortcuts.ts',
    'src/screens/PlaceholderScreen.tsx',
  ];

  const baseDir = process.cwd().endsWith('desktop') ? process.cwd() : path.resolve(process.cwd(), 'desktop');

  for (const relPath of requiredFiles) {
    const fullPath = path.resolve(baseDir, relPath);
    assert(fs.existsSync(fullPath), `Required component exists: ${relPath}`);
  }

  // 2. Verify Keyboard Shortcuts Events
  assert(BANDREK_EVENTS.NEW_KEGIATAN === 'bandrek:new-kegiatan', 'Ctrl+N dispatches bandrek:new-kegiatan');
  assert(BANDREK_EVENTS.SAVE === 'bandrek:save', 'Ctrl+S dispatches bandrek:save');
  assert(BANDREK_EVENTS.TOGGLE_RAIL === 'bandrek:toggle-rail', 'Ctrl+B dispatches bandrek:toggle-rail');
  assert(BANDREK_EVENTS.QUICK_SEARCH === 'bandrek:quick-search', 'Ctrl+K dispatches bandrek:quick-search');
  assert(BANDREK_EVENTS.ESC_PRESSED === 'bandrek:esc-pressed', 'Esc dispatches bandrek:esc-pressed');

  // 3. Verify Navigation Rail configuration
  const navRailContent = fs.readFileSync(path.resolve(baseDir, 'src/components/layout/NavigationRail.tsx'), 'utf-8');
  assert(navRailContent.includes('/kalender') && navRailContent.includes('Alt+1'), 'NavRail has Kalender (Alt+1)');
  assert(navRailContent.includes('/kegiatan') && navRailContent.includes('Alt+2'), 'NavRail has Kegiatan (Alt+2)');
  assert(navRailContent.includes('/matriks') && navRailContent.includes('Alt+3'), 'NavRail has Matriks (Alt+3)');
  assert(navRailContent.includes('/master/siswa') && navRailContent.includes('Alt+4'), 'NavRail has Siswa (Alt+4)');
  assert(navRailContent.includes('/master/subjek') && navRailContent.includes('Alt+5'), 'NavRail has Subjek (Alt+5)');
  assert(navRailContent.includes('/master/mapel') && navRailContent.includes('Alt+6'), 'NavRail has Mata Pelajaran (Alt+6)');
  assert(navRailContent.includes('/master/kelas') && navRailContent.includes('Alt+7'), 'NavRail has Kelas (Alt+7)');
  assert(navRailContent.includes('/master/tempat') && navRailContent.includes('Alt+8'), 'NavRail has Tempat (Alt+8)');
  assert(navRailContent.includes('/master/jenis') && navRailContent.includes('Alt+9'), 'NavRail has Jenis (Alt+9)');
  assert(navRailContent.includes('/kegiatan?filter=perlu_realisasi'), 'NavRail badge links to /kegiatan?filter=perlu_realisasi');

  // 4. Verify Perlu Realisasi data connection
  const perluCount = await repositories.realisasi.getPerluRealisasiCount();
  assert(perluCount > 0, `Live data layer provides perluCount (${perluCount}) to NavigationRail`);

  // 5. Verify Toast Dynamic Placement Support
  const toastContent = fs.readFileSync(path.resolve(baseDir, 'src/components/ui/toast.tsx'), 'utf-8');
  assert(toastContent.includes('offsetRight'), 'ToastContainer supports dynamic offsetRight for side panels');
  assert(toastContent.includes('setOffsetRight'), 'ToastContext exports setOffsetRight');

  // 6. Verify Offline Banner Infrastructure in Shell
  const shellContent = fs.readFileSync(path.resolve(baseDir, 'src/components/layout/AppShell.tsx'), 'utf-8');
  assert(shellContent.includes('<OfflineBanner'), 'AppShell conditionally mounts OfflineBanner');
  assert(shellContent.includes('isOffline'), 'AppShell derives offline status from simulasi / network state');
  assert(shellContent.includes('setOffsetRight(e.detail.width ? e.detail.width + 16 : 514)'), 'AppShell shifts toasts when side panel opens');

  // 7. Verify Routing in App.tsx
  const appContent = fs.readFileSync(path.resolve(baseDir, 'src/App.tsx'), 'utf-8');
  assert(appContent.includes('<Route element={<AppShell />}>'), 'App.tsx wraps routes in AppShell');
  assert(appContent.includes('path="/kalender"'), 'App.tsx defines /kalender route');
  assert(appContent.includes('path="/kegiatan"'), 'App.tsx defines /kegiatan route');
  assert(appContent.includes('path="/matriks"'), 'App.tsx defines /matriks route');

  console.log(`\n=== APP SHELL TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runShellTests();
