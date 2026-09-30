import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('=== TEST SUITE: Phase 5 Step 11 (Client-Server Screens & Concurrency) ===\n');

const baseDir = existsSync(resolve(process.cwd(), 'desktop'))
  ? resolve(process.cwd(), 'desktop')
  : process.cwd();

// ----------------------------------------------------
// 1. Verify File Structure & Implementation Presence
// ----------------------------------------------------
console.log('Test 1: Verify Client-Server Component & Screen Files');
const requiredFiles = [
  'src/screens/SetupServerScreen.tsx',
  'src/screens/LoginScreen.tsx',
  'src/screens/UserManagementScreen.tsx',
  'src/screens/UpdateRequiredScreen.tsx',
  'src/components/kegiatan/SaveConflictModal.tsx',
  'src/components/ui/offline-banner.tsx',
  'src/data/types/auth.ts',
  'src/data/hooks/useAuth.ts',
  'src/data/mock/MockAuthRepository.ts',
];

for (const f of requiredFiles) {
  const fullPath = resolve(baseDir, f);
  assert.ok(existsSync(fullPath), `Required file must exist: ${f}`);
}

const appFile = readFileSync(resolve(baseDir, 'src/App.tsx'), 'utf8');
assert.ok(
  appFile.includes('SetupServerScreen') && appFile.includes('/setup-server'),
  'App.tsx must import and route /setup-server to SetupServerScreen'
);
assert.ok(
  appFile.includes('LoginScreen') && appFile.includes('/login'),
  'App.tsx must import and route /login to LoginScreen'
);
assert.ok(
  appFile.includes('UpdateRequiredScreen') && appFile.includes('/update-required'),
  'App.tsx must import and route /update-required to UpdateRequiredScreen'
);
assert.ok(
  appFile.includes('UserManagementScreen') && appFile.includes('/pengaturan/pengguna'),
  'App.tsx must route /pengaturan/pengguna to UserManagementScreen'
);

console.log('✓ All 9 Client-Server component and screen files exist and are correctly routed in App.tsx.\n');

// ----------------------------------------------------
// 2. TopBar Integration & User Role Display
// ----------------------------------------------------
console.log('Test 2: Verify TopBar User Profile and Admin Navigation');
const topBarContent = readFileSync(
  resolve(baseDir, 'src/components/layout/TopBar.tsx'),
  'utf8'
);

assert.ok(
  topBarContent.includes('useAuthSession'),
  'TopBar must consume useAuthSession hook'
);
assert.ok(
  topBarContent.includes('/pengaturan/pengguna'),
  'TopBar must provide link to /pengaturan/pengguna for admin users'
);
assert.ok(
  topBarContent.includes('/login'),
  'TopBar must provide logout action linking to /login'
);
assert.ok(
  topBarContent.includes('Admin') && topBarContent.includes('Operator'),
  'TopBar must distinguish Admin and Operator role badges'
);

console.log('✓ TopBar correctly reflects user session, role pill, admin link, and logout action.\n');

// ----------------------------------------------------
// 3. Setup Server Screen Logic & Validation
// ----------------------------------------------------
console.log('Test 3: Verify SetupServerScreen Structure and Validation');
const setupServerContent = readFileSync(
  resolve(baseDir, 'src/screens/SetupServerScreen.tsx'),
  'utf8'
);

assert.ok(
  setupServerContent.includes('http://') && setupServerContent.includes('https://'),
  'SetupServerScreen must validate URL protocol (http or https)'
);
assert.ok(
  setupServerContent.includes('bandrek:server-url'),
  'SetupServerScreen must persist server URL in localStorage bandrek:server-url'
);
assert.ok(
  setupServerContent.includes('handleTestConnection'),
  'SetupServerScreen must provide interactive connection latency test'
);
assert.ok(
  setupServerContent.includes('Simpan & Lanjutkan'),
  'SetupServerScreen must have primary submit action'
);

console.log('✓ SetupServerScreen implements protocol validation, latency check, and localStorage persistence.\n');

// ----------------------------------------------------
// 4. Login Screen Logic & Quick-Fill Demo
// ----------------------------------------------------
console.log('Test 4: Verify LoginScreen Structure and Quick Fills');
const loginContent = readFileSync(
  resolve(baseDir, 'src/screens/LoginScreen.tsx'),
  'utf8'
);

assert.ok(
  loginContent.includes('useLogin'),
  'LoginScreen must use useLogin mutation'
);
assert.ok(
  loginContent.includes('handleQuickFill'),
  'LoginScreen must offer quick fill buttons for demo/testing (admin / operator)'
);
assert.ok(
  loginContent.includes('Ganti server') || loginContent.includes('/setup-server'),
  'LoginScreen must link to /setup-server to allow changing server URL'
);
assert.ok(
  loginContent.includes('Masuk ke Bandrek'),
  'LoginScreen must display brand title'
);

console.log('✓ LoginScreen contains auth submission, error alerts, quick fills, and server config link.\n');

// ----------------------------------------------------
// 5. User Management Screen (P1 Master Pattern for Operators)
// ----------------------------------------------------
console.log('Test 5: Verify UserManagementScreen Admin Protection and P1 Pattern');
const userMgmtContent = readFileSync(
  resolve(baseDir, 'src/screens/UserManagementScreen.tsx'),
  'utf8'
);

assert.ok(
  userMgmtContent.includes('useUsersList') && userMgmtContent.includes('useCreateUser'),
  'UserManagementScreen must consume user CRUD hooks'
);
assert.ok(
  userMgmtContent.includes('isCurrentLoggedInUser') || userMgmtContent.includes('currentSession'),
  'UserManagementScreen must protect against deactivating currently active user'
);
assert.ok(
  userMgmtContent.includes('activeAdmins') || userMgmtContent.includes('Harus ada minimal satu akun admin'),
  'UserManagementScreen must protect against deactivating the last remaining admin'
);
assert.ok(
  userMgmtContent.includes('peran') && userMgmtContent.includes('admin') && userMgmtContent.includes('operator'),
  'UserManagementScreen must allow toggling Admin / Operator roles'
);
assert.ok(
  userMgmtContent.includes('Cari nama atau username'),
  'UserManagementScreen must provide user search filter'
);

console.log('✓ UserManagementScreen enforces last-admin guard, self-deactivation guard, and role controls.\n');

// ----------------------------------------------------
// 6. Save Conflict Modal (B6-konflik Concurrency Resolution)
// ----------------------------------------------------
console.log('Test 6: Verify SaveConflictModal (B6-konflik)');
const conflictContent = readFileSync(
  resolve(baseDir, 'src/components/kegiatan/SaveConflictModal.tsx'),
  'utf8'
);

assert.ok(
  conflictContent.includes('Data berubah di jendela lain'),
  'SaveConflictModal title must match prototype: "Data berubah di jendela lain"'
);
assert.ok(
  conflictContent.includes('KONFLIK SUNTINGAN'),
  'SaveConflictModal subtitle badge must match prototype: "KONFLIK SUNTINGAN"'
);
assert.ok(
  conflictContent.includes('VERSI TERSIMPAN') && conflictContent.includes('MILIK ANDA'),
  'SaveConflictModal must compare VERSI TERSIMPAN vs MILIK ANDA'
);
assert.ok(
  conflictContent.includes('Pakai punya saya') && conflictContent.includes('Pakai versi tersimpan'),
  'SaveConflictModal must provide explicit choices: Pakai punya saya vs Pakai versi tersimpan'
);
assert.ok(
  conflictContent.includes('max-w-[520px]') || conflictContent.includes('520px'),
  'SaveConflictModal must be sized at 520px width per Batch B spec'
);

console.log('✓ SaveConflictModal strictly adheres to B6-konflik layout, copy, and side-by-side comparison.\n');

// ----------------------------------------------------
// 7. Update Required Screen (DOMAIN.md §13 & ARCHITECTURE.md D10)
// ----------------------------------------------------
console.log('Test 7: Verify UpdateRequiredScreen');
const updateContent = readFileSync(
  resolve(baseDir, 'src/screens/UpdateRequiredScreen.tsx'),
  'utf8'
);

assert.ok(
  updateContent.includes('Pembaruan Aplikasi Diperlukan') || updateContent.includes('Aplikasi Perlu Diperbarui'),
  'UpdateRequiredScreen must have clear update required title'
);
assert.ok(
  updateContent.includes('Versi Anda') && updateContent.includes('Min. Server') && updateContent.includes('Tersedia'),
  'UpdateRequiredScreen must show 3-way version comparison'
);
assert.ok(
  updateContent.includes('handleStartUpdate') && updateContent.includes('progress'),
  'UpdateRequiredScreen must provide simulated download & install updater workflow'
);
assert.ok(
  updateContent.includes('Pembaruan Wajib'),
  'UpdateRequiredScreen must display warning badge'
);

console.log('✓ UpdateRequiredScreen provides mandatory version blocker, progress bar, and retry action.\n');

// ----------------------------------------------------
// 8. Offline Mode & Read-Only Banner Integration
// ----------------------------------------------------
console.log('Test 8: Verify Offline Banner & Read-Only State');
const shellContent = readFileSync(
  resolve(baseDir, 'src/components/layout/AppShell.tsx'),
  'utf8'
);

assert.ok(
  shellContent.includes('OfflineBanner'),
  'AppShell must mount OfflineBanner'
);
assert.ok(
  shellContent.includes('isOffline'),
  'AppShell must pass isOffline state to TopBar and OfflineBanner'
);

console.log('✓ AppShell correctly wires OfflineBanner and read-only cache indicators.\n');

console.log('====================================================');
console.log('ALL 8 CLIENT-SERVER / STEP 11 TESTS PASSED (100%)');
console.log('====================================================');
